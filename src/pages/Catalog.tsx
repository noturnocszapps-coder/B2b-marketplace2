import { useState, useEffect } from 'react';
import { supabase, type Product } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Package, 
  Plus, 
  Minus,
  CheckCircle2,
  X,
  Copy,
  ExternalLink,
  QrCode,
  ChevronRight,
  Info,
  Trash2
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { generatePixPayload } from '../lib/pix';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

export default function Catalog() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(name, parent_category), supplier:companies(name)')
        .eq('is_active', true)
        .gt('stock_quantity', 0);

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar produtos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const addToCart = (product: Product) => {
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1000);

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          toast.warning('Estoque máximo atingido');
          return prev;
        }
        toast.success(`+1 ${product.name} adicionado`);
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      toast.success(`${product.name} adicionado ao carrinho`);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    toast.info('Produto removido');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, Math.min(item.quantity + delta, item.product.stock_quantity));
        if (newQty === item.product.stock_quantity && delta > 0) {
          toast.warning('Estoque máximo atingido');
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0 || !profile) return;
    setIsCheckingOut(true);

    try {
      // Identify the supplier from the first item in cart
      const supplierId = cart[0].product.supplier_id;
      const { data: supplierCompany, error: supplierError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', supplierId)
        .single();
      
      if (supplierError || !supplierCompany) throw new Error('Fornecedor não encontrado.');
      
      if (!supplierCompany.pix_key) {
        throw new Error('Fornecedor sem chave Pix cadastrada. O checkout não pode ser concluído.');
      }

      let finalRetailerId = '';

      if (profile.role === 'admin') {
        // For admin, we could show a selector, but for now let's just pick the first retailer 
        // or throw a more informative error.
        const { data: firstRetailer, error: fetchError } = await supabase
          .from('companies')
          .select('id')
          .eq('type', 'retailer')
          .limit(1)
          .maybeSingle();
        
        if (fetchError || !firstRetailer) {
          throw new Error('Nenhum lojista cadastrado no sistema para realizar o pedido administrativo.');
        }
        finalRetailerId = firstRetailer.id;
      } else {
        // Try to find the company
        const { data: company, error: fetchError } = await supabase
          .from('companies')
          .select('id')
          .eq('profile_id', profile.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!company) {
          // If company is missing for a retailer, try to create it on the fly
          if (profile.role === 'retailer') {
            const { data: newCompany, error: createError } = await supabase
              .from('companies')
              .insert({
                profile_id: profile.id,
                name: profile.full_name || 'Minha Empresa',
                type: 'retailer'
              })
              .select()
              .single();
            
            if (createError) throw new Error('Não foi possível vincular uma empresa ao seu perfil. Por favor, contate o suporte.');
            finalRetailerId = newCompany.id;
          } else {
            throw new Error('Empresa não encontrada para o seu perfil.');
          }
        } else {
          finalRetailerId = company.id;
        }
      }

      // Generate Pix Payload
      const pixCode = generatePixPayload({
        key: supplierCompany.pix_key,
        recipient: supplierCompany.pix_recipient_name || supplierCompany.name,
        city: supplierCompany.address?.split(',')[0] || 'SAO PAULO',
        amount: cartTotal,
        description: `Pedido B2B Market`
      });

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          retailer_id: finalRetailerId,
          total_amount: cartTotal,
          status: 'aguardando pagamento',
          pix_code: pixCode
        })
        .select('*, retailer:companies(name, whatsapp)')
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_purchase: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update stock
      for (const item of cart) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock_quantity: item.product.stock_quantity - item.quantity })
          .eq('id', item.product.id);
        
        if (stockError) throw stockError;
      }

      // Create delivery record
      await supabase
        .from('deliveries')
        .insert({
          order_id: order.id,
          status: 'aguardando entregador'
        });

      // Add supplier info to order object for the modal
      const orderWithSupplier = {
        ...order,
        supplier: supplierCompany
      };

      setCurrentOrder(orderWithSupplier);
      setShowPaymentModal(true);
      setCart([]);
      setIsCartOpen(false);
      toast.success('Pedido criado com sucesso! Aguardando pagamento.');
    } catch (error: any) {
      toast.error('Erro ao finalizar pedido: ' + error.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Catálogo de Atacado</h1>
          <p className="text-zinc-500">Encontre os melhores produtos para sua loja.</p>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all shadow-lg shadow-orange-600/20"
        >
          <ShoppingCart size={20} />
          Carrinho
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-orange-600 rounded-full flex items-center justify-center text-xs font-bold border-2 border-orange-600">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input 
            type="text"
            placeholder="O que você está procurando hoje?"
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-orange-500 transition-all text-lg"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "whitespace-nowrap px-6 py-4 rounded-xl border transition-all font-semibold",
              !selectedCategory 
                ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20" 
                : "bg-[#0A0A0A] border-white/10 text-zinc-400 hover:text-white"
            )}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "whitespace-nowrap px-6 py-4 rounded-xl border transition-all font-semibold",
                selectedCategory === cat.id
                  ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20" 
                  : "bg-[#0A0A0A] border-white/10 text-zinc-400 hover:text-white"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-4 animate-pulse">
              <div className="aspect-square bg-zinc-800 rounded-2xl mb-4" />
              <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-1/2 mb-4" />
              <div className="h-8 bg-zinc-800 rounded" />
            </div>
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-zinc-700" />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhum produto encontrado</h3>
            <p className="text-zinc-500">Tente ajustar sua busca ou filtro.</p>
          </div>
        ) : filteredProducts.map((product) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-[#0A0A0A] border border-white/10 rounded-3xl p-4 hover:border-orange-600/30 transition-all"
          >
            <div className="relative aspect-square bg-zinc-900 rounded-2xl mb-4 overflow-hidden">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={48} className="text-zinc-800" />
                </div>
              )}
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                {product.category?.name}
              </div>
            </div>

            <div className="space-y-1 mb-4">
              <h3 className="font-bold text-lg truncate">{product.name}</h3>
              <p className="text-xs text-zinc-500 truncate">Fornecido por: {product.supplier?.name}</p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xl font-black text-white">{formatCurrency(product.price)}</span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Estoque: {product.stock_quantity}</span>
              </div>
            </div>

            <button 
              onClick={() => addToCart(product)}
              className={cn(
                "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                addedProductId === product.id 
                  ? "bg-green-600 text-white" 
                  : "bg-white/5 hover:bg-orange-600 text-white group-hover:bg-orange-600"
              )}
            >
              {addedProductId === product.id ? (
                <>
                  <CheckCircle2 size={18} />
                  Adicionado
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Adicionar
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0A0A0A] border-l border-white/10 z-[101] flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <ShoppingCart size={24} className="text-orange-500" />
                  Seu Carrinho
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                      <ShoppingCart size={32} className="text-zinc-700" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Seu carrinho está vazio</h3>
                    <p className="text-zinc-500 text-sm">Adicione produtos do catálogo para começar seu pedido.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4">
                      <div className="w-20 h-20 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0">
                        {item.product.image_url ? (
                          <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-zinc-800" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate">{item.product.name}</h4>
                        <p className="text-sm text-zinc-500 mb-2">{formatCurrency(item.product.price)} / un</p>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10"
                          >
                            <Plus size={14} />
                          </button>
                          <button 
                            onClick={() => removeFromCart(item.product.id)}
                            className="ml-auto text-xs text-red-500 font-bold hover:underline"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-[#050505] space-y-4">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-orange-500">{formatCurrency(cartTotal)}</span>
                  </div>
                  <button 
                    disabled={isCheckingOut}
                    onClick={handleCheckout}
                    className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isCheckingOut ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} />
                        Finalizar Pedido (Pix)
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && currentOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-orange-600/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center text-orange-500">
                    <QrCode size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Pagamento Pix</h3>
                    <p className="text-xs text-zinc-500">Pedido #{currentOrder.id.substring(0, 8)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                {/* Status Badge */}
                <div className="flex justify-center">
                  <div className="px-4 py-2 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-500 text-sm font-bold flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    Aguardando Pagamento
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-white rounded-2xl shadow-inner">
                    <QRCodeSVG 
                      value={currentOrder.pix_code || ''} 
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 text-center max-w-[200px]">
                    Escaneie o QR Code acima com o aplicativo do seu banco
                  </p>
                </div>

                {/* Amount */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-zinc-400">Valor Total</span>
                  <span className="text-2xl font-bold text-orange-500">
                    {formatCurrency(currentOrder.total_amount)}
                  </span>
                </div>

                {/* Pix Code Copy */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                    Código Copia e Cola
                  </label>
                  <div className="relative group">
                    <div className="w-full p-4 pr-12 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono break-all text-zinc-300">
                      {currentOrder.pix_code}
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(currentOrder.pix_code || '');
                        toast.success('Código Pix copiado!');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 active:scale-95"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>

                {/* Supplier Info */}
                <div className="p-4 rounded-2xl bg-orange-600/5 border border-orange-600/10 space-y-3">
                  <div className="flex items-center gap-2 text-orange-500 font-bold text-sm">
                    <Info size={16} />
                    <span>Dados do Recebedor</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-zinc-500 mb-1">Empresa</p>
                      <p className="font-medium">{currentOrder.supplier?.name}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Chave Pix</p>
                      <p className="font-medium truncate">{currentOrder.supplier?.pix_key}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 bg-white/5 border-t border-white/10 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate('/orders')}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all flex items-center justify-center gap-2"
                >
                  Ver Meus Pedidos
                </button>
                <button 
                  onClick={() => {
                    const message = encodeURIComponent(`Olá, acabei de realizar o pedido #${currentOrder.id.substring(0, 8)} e gostaria de confirmar o pagamento.`);
                    window.open(`https://wa.me/${currentOrder.supplier?.whatsapp?.replace(/\D/g, '')}?text=${message}`, '_blank');
                  }}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <ExternalLink size={18} />
                  WhatsApp
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
