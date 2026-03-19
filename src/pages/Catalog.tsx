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
  DollarSign,
  ExternalLink,
  QrCode,
  ChevronRight,
  Info,
  Trash2,
  Star,
  Zap,
  Truck,
  Moon,
  Clock,
  ChevronDown,
  ArrowUpDown,
  Heart,
  LayoutGrid,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { generatePixPayload } from '../lib/pix';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { getShippingDetails, getEstimatedShipping, type ShippingResult } from '../lib/shipping';
import { getSupplierStatus, STATUS_CONFIG, getCompanyPlan, PLAN_CONFIG } from '../lib/supplier';
import { TAXONOMY } from '../constants/taxonomy';
import { ProductSkeleton } from '../components/Skeleton';

export default function Catalog() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'cash' | 'mercado_pago'>('pix');
  const [changeFor, setChangeFor] = useState<string>('');
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [activeFilters, setActiveFilters] = useState({
    featured: false,
    available: false,
    freeShipping: false,
    nightService: false,
    is24h: false,
    favorites: false
  });
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [shippingDetails, setShippingDetails] = useState<ShippingResult | null>(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    const history = localStorage.getItem('searchHistory');
    if (history) setSearchHistory(JSON.parse(history));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToSearchHistory = (term: string) => {
    if (!term.trim()) return;
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(name, parent_category), supplier:companies(*)')
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
    // Enforce single supplier
    if (cart.length > 0 && cart[0].product.supplier_id !== product.supplier_id) {
      toast.error('Você só pode adicionar produtos de um mesmo fornecedor por pedido.', {
        description: 'Deseja limpar o carrinho para adicionar este produto?',
        action: {
          label: 'Limpar Carrinho',
          onClick: () => {
            const initialQty = product.min_quantity || 1;
            setCart([{ product, quantity: initialQty }]);
            setAddedProductId(product.id);
            setTimeout(() => setAddedProductId(null), 1000);
            toast.success(`${product.name} adicionado ao carrinho`);
          }
        }
      });
      return;
    }

    setAddedProductId(product.id);
    setLastAddedId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
      setLastAddedId(null);
    }, 1500);

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const step = product.purchase_multiple || 1;
        const newQty = existing.quantity + step;
        if (newQty > product.stock_quantity) {
          toast.warning('Estoque máximo atingido');
          return prev;
        }
        toast.success(`+${step} ${product.name} adicionado`);
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: newQty } 
            : item
        );
      }
      const initialQty = product.min_quantity || 1;
      toast.success(`${product.name} adicionado ao carrinho`);
      return [...prev, { product, quantity: initialQty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    toast.info('Produto removido');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const step = item.product.purchase_multiple || 1;
        const minQty = item.product.min_quantity || 1;
        const actualDelta = delta > 0 ? step : -step;
        const newQty = Math.max(minQty, Math.min(item.quantity + actualDelta, item.product.stock_quantity));
        
        if (newQty === item.product.stock_quantity && delta > 0) {
          toast.warning('Estoque máximo atingido');
        }

        if (delta > 0) {
          setLastAddedId(productId);
          setTimeout(() => setLastAddedId(null), 500);
        }

        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const toggleFavorite = async (productId: string) => {
    if (!profile) {
      toast.error('Faça login para favoritar produtos');
      return;
    }

    const isFavorite = favorites.includes(productId);
    if (isFavorite) {
      setFavorites(prev => prev.filter(id => id !== productId));
      toast.info('Removido dos favoritos');
    } else {
      setFavorites(prev => [...prev, productId]);
      toast.success('Adicionado aos favoritos');
    }

    // Attempt to sync with Supabase if a favorites table exists
    try {
      if (isFavorite) {
        await supabase.from('favorites').delete().eq('profile_id', profile.id).eq('product_id', productId);
      } else {
        await supabase.from('favorites').insert({ profile_id: profile.id, product_id: productId });
      }
    } catch (e) {
      // Ignore errors if table doesn't exist
    }
  };

  const getProductPrice = (product: Product, quantity: number) => {
    let price = product.price;
    if (product.volume_discounts && product.volume_discounts.length > 0) {
      const sortedDiscounts = [...product.volume_discounts].sort((a, b) => b.min_quantity - a.min_quantity);
      const applicableDiscount = sortedDiscounts.find(d => quantity >= d.min_quantity);
      if (applicableDiscount) {
        price = price * (1 - applicableDiscount.discount_percentage / 100);
      }
    }
    return price;
  };

  const cartTotal = cart.reduce((sum, item) => sum + (getProductPrice(item.product, item.quantity) * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalSavings = cart.reduce((sum, item) => {
    const originalPrice = item.product.price;
    const discountedPrice = getProductPrice(item.product, item.quantity);
    return sum + (originalPrice - discountedPrice) * item.quantity;
  }, 0);

  const getNextDiscount = (product: Product, currentQty: number) => {
    if (!product.volume_discounts || product.volume_discounts.length === 0) return null;
    const sortedDiscounts = [...product.volume_discounts].sort((a, b) => a.min_quantity - b.min_quantity);
    return sortedDiscounts.find(d => currentQty < d.min_quantity);
  };

  // Calculate shipping whenever cart changes
  useEffect(() => {
    async function updateShipping() {
      if (cart.length === 0 || !profile) {
        setShippingDetails(null);
        return;
      }

      setCalculatingShipping(true);
      try {
        const supplierId = cart[0].product.supplier_id;
        
        // Fetch supplier and retailer details for addresses
        const [supplierRes, retailerRes] = await Promise.all([
          supabase.from('companies').select('*').eq('id', supplierId).single(),
          supabase.from('companies').select('*').eq('profile_id', profile.id).maybeSingle()
        ]);

        if (supplierRes.data && retailerRes.data) {
          const totalWeight = cart.reduce((sum, item) => sum + ((item.product.weight || 1) * item.quantity), 0);
          const details = getShippingDetails(
            cartTotal,
            totalWeight,
            supplierRes.data.address || '',
            retailerRes.data.address || '',
            supplierRes.data
          );
          setShippingDetails(details);
        }
      } catch (error) {
        console.error('Error calculating shipping:', error);
      } finally {
        setCalculatingShipping(false);
      }
    }

    updateShipping();
  }, [cart, cartTotal, profile]);

  const handleCheckout = async () => {
    if (cart.length === 0 || !profile) return;
    setIsCheckingOut(true);

    try {
      // 1. Re-verify product status and stock
      const productIds = cart.map(item => item.product.id);
      const { data: currentProducts, error: productsError } = await supabase
        .from('products')
        .select('id, name, stock_quantity, is_active, min_quantity, purchase_multiple')
        .in('id', productIds);

      if (productsError) throw productsError;

      for (const item of cart) {
        const current = currentProducts?.find(p => p.id === item.product.id);
        if (!current) {
          throw new Error(`Produto "${item.product.name}" não encontrado.`);
        }
        if (!current.is_active) {
          throw new Error(`Produto "${item.product.name}" não está mais disponível.`);
        }
        if (current.stock_quantity < item.quantity) {
          throw new Error(`Estoque insuficiente para "${item.product.name}". Disponível: ${current.stock_quantity}`);
        }

        // 1.1 Verify min_quantity and purchase_multiple
        const minQty = current.min_quantity || 1;
        const multiple = current.purchase_multiple || 1;
        if (item.quantity < minQty) {
          throw new Error(`Quantidade mínima para "${item.product.name}" é ${minQty}.`);
        }
        if ((item.quantity - minQty) % multiple !== 0) {
          throw new Error(`Quantidade de "${item.product.name}" deve ser múltiplo de ${multiple} após o mínimo.`);
        }
      }

      // 2. Identify the supplier from the first item in cart
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
      let finalRetailer = null;

      if (profile.role === 'admin') {
        // For admin, we could show a selector, but for now let's just pick the first retailer 
        // or throw a more informative error.
        const { data: firstRetailer, error: fetchError } = await supabase
          .from('companies')
          .select('*')
          .eq('type', 'retailer')
          .limit(1)
          .maybeSingle();
        
        if (fetchError || !firstRetailer) {
          throw new Error('Nenhum lojista cadastrado no sistema para realizar o pedido administrativo.');
        }
        finalRetailerId = firstRetailer.id;
        finalRetailer = firstRetailer;
      } else {
        // Try to find the company
        const { data: company, error: fetchError } = await supabase
          .from('companies')
          .select('*')
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
            finalRetailer = newCompany;
          } else {
            throw new Error('Empresa não encontrada para o seu perfil.');
          }
        } else {
          finalRetailerId = company.id;
          finalRetailer = company;
        }
      }

      // Generate Pix Payload
      const pixCode = generatePixPayload({
        key: supplierCompany.pix_key,
        recipient: supplierCompany.pix_recipient_name || supplierCompany.name,
        city: supplierCompany.address?.split(',')[0] || 'SAO PAULO',
        amount: shippingDetails ? shippingDetails.total : cartTotal,
        description: `Pedido B2B Market`
      });

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          retailer_id: finalRetailerId,
          total_amount: shippingDetails ? shippingDetails.total : cartTotal,
          delivery_fee: shippingDetails?.deliveryFee || 0,
          is_free_shipping: shippingDetails?.isFreeShipping || false,
          status: paymentMethod === 'pix' ? 'aguardando pagamento' : 'pendente',
          payment_method: paymentMethod,
          change_for: paymentMethod === 'cash' ? Number(changeFor) || null : null,
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
        price_at_purchase: getProductPrice(item.product, item.quantity)
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

      // Create delivery record with shipping details
      await supabase
        .from('deliveries')
        .insert({
          order_id: order.id,
          status: 'aguardando entregador',
          delivery_fee: shippingDetails?.deliveryFee || 0,
          distance_km: shippingDetails?.distanceKm || 0,
          vehicle_type: shippingDetails?.vehicleType || 'MOTO',
          is_free_shipping: shippingDetails?.isFreeShipping || false,
          driver_payout: shippingDetails?.driverPayout || 0,
          platform_fee: shippingDetails?.platformFee || 0,
          pickup_address: supplierCompany.address,
          delivery_address: finalRetailer?.address
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

  const filteredProducts = products
    .filter(p => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(searchLower) ||
                           p.category?.name.toLowerCase().includes(searchLower) ||
                           p.subcategory?.toLowerCase().includes(searchLower) ||
                           p.brand?.toLowerCase().includes(searchLower) ||
                           p.supplier?.name.toLowerCase().includes(searchLower);
      const matchesCategory = !selectedCategory || p.category?.name === selectedCategory;
      const matchesSubcategory = !selectedSubcategory || p.subcategory === selectedSubcategory;
      
      // Handle nested subtype/variation filtering
      let matchesSubtype = true;
      if (selectedSubtype) {
        const subcategory = TAXONOMY.find(c => c.name === selectedCategory)
          ?.subcategories.find(s => s.name === selectedSubcategory);
        const subtypeObj = subcategory?.subtypes?.find(t => 
          (typeof t === 'string' ? t : t.name) === selectedSubtype
        );
        
        const isGroup = typeof subtypeObj === 'object';

        if (selectedVariation) {
          // Exact match for the combination
          matchesSubtype = p.subtype === `${selectedSubtype} ${selectedVariation}` || p.brand === selectedVariation;
        } else if (isGroup) {
          // Match any variation of the group
          matchesSubtype = p.subtype?.startsWith(selectedSubtype) || p.brand?.includes(selectedSubtype);
        } else {
          // Simple exact match
          matchesSubtype = p.subtype === selectedSubtype || p.brand === selectedSubtype;
        }
      }
      
      const supplier = p.supplier as any;
      const status = getSupplierStatus(supplier);
      
      const matchesFeatured = !activeFilters.featured || supplier?.is_featured;
      const matchesAvailable = !activeFilters.available || status !== 'indisponivel';
      const matchesFreeShipping = !activeFilters.freeShipping || supplier?.free_shipping_enabled;
      const matchesNight = !activeFilters.nightService || supplier?.night_service;
      const matches24h = !activeFilters.is24h || supplier?.is_24h;
      const matchesFavorites = !activeFilters.favorites || favorites.includes(p.id);

      return matchesSearch && matchesCategory && matchesSubcategory && matchesSubtype && matchesFeatured && matchesAvailable && matchesFreeShipping && matchesNight && matches24h && matchesFavorites;
    })
    .sort((a, b) => {
      const aSupplier = a.supplier as any;
      const bSupplier = b.supplier as any;
      const aPlan = getCompanyPlan(aSupplier);
      const bPlan = getCompanyPlan(bSupplier);
      
      const planPriority = { premium: 3, featured: 2, free: 1 };
      const aPriority = planPriority[aPlan] || 1;
      const bPriority = planPriority[bPlan] || 1;

      // Base sorting by plan first if not explicitly sorted by price
      if (sortBy === 'featured') {
        if (bPriority !== aPriority) return bPriority - aPriority;
        if (bSupplier?.is_featured !== aSupplier?.is_featured) {
          return (bSupplier?.is_featured ? 1 : 0) - (aSupplier?.is_featured ? 1 : 0);
        }
      }

      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'best_sellers') return (b.stock_quantity || 0) - (a.stock_quantity || 0); // Mock best sellers with stock or similar

      // Default fallback
      if (bPriority !== aPriority) return bPriority - aPriority;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const categoryIcons: Record<string, any> = {
    'Alimentos': '🍎',
    'Bebidas': '🥤',
    'Limpeza': '🧹',
    'Higiene': '🧼',
    'Hortifruti': '🥦',
    'Padaria': '🥖',
    'Carnes': '🥩',
    'Laticínios': '🧀',
    'Congelados': '❄️',
    'Pet Shop': '🐶',
    'Bazar': '🎁',
    'Eletrônicos': '📱'
  };

  const toggleFilter = (filter: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
  };

  return (
    <div className="space-y-8 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Catálogo <span className="text-orange-600">B2B</span></h1>
          <p className="text-zinc-500 font-medium">Abasteça sua loja com os melhores fornecedores.</p>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 -mx-6 px-6 py-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Buscar por produto, marca, categoria ou fornecedor..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 focus:outline-none focus:border-orange-500 transition-all text-lg shadow-inner"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setShowSearchHistory(true)}
              onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
              onKeyDown={e => e.key === 'Enter' && addToSearchHistory(searchTerm)}
            />
            
            <AnimatePresence>
              {showSearchHistory && searchHistory.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
                >
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Buscas Recentes</div>
                    {searchHistory.map((term, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          setSearchTerm(term);
                          setShowSearchHistory(false);
                        }}
                        className="w-full text-left px-3 py-3 hover:bg-white/5 rounded-xl flex items-center gap-3 transition-all"
                      >
                        <Clock size={16} className="text-zinc-600" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="relative min-w-[200px]">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl px-4 py-4 appearance-none focus:outline-none focus:border-orange-500 transition-all font-bold text-sm cursor-pointer"
            >
              <option value="featured">Destaques</option>
              <option value="best_sellers">Mais Vendidos</option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
              <option value="newest">Mais Recentes</option>
            </select>
            <ArrowUpDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        {/* Categories Hierarchical Navigation */}
        <div className="space-y-4 pt-6">
          {/* Level 1: Main Categories */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
                setSelectedSubtype(null);
                setSearchTerm('');
              }}
              className={cn(
                "flex-shrink-0 px-6 py-3 rounded-2xl font-bold transition-all border flex items-center gap-2",
                !selectedCategory && !searchTerm
                  ? "bg-orange-600 border-orange-400 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)] ring-2 ring-orange-600/20 scale-105" 
                  : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
              )}
            >
              <LayoutGrid size={18} />
              Todos
            </button>
            {TAXONOMY.map((cat) => (
              <button 
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setSelectedSubcategory(null);
                  setSelectedSubtype(null);
                  setSearchTerm('');
                }}
                className={cn(
                  "flex-shrink-0 px-6 py-3 rounded-2xl font-bold transition-all border flex items-center gap-2",
                  selectedCategory === cat.name
                    ? "bg-orange-600 border-orange-400 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)] ring-2 ring-orange-600/20 scale-105" 
                    : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                )}
              >
                <span className="text-xl">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Level 2: Subcategories */}
          <AnimatePresence mode="wait">
            {selectedCategory && (
              <motion.div 
                key={selectedCategory}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex gap-2 overflow-x-auto no-scrollbar py-1"
              >
                {TAXONOMY.find(c => c.name === selectedCategory)?.subcategories.map(sub => (
                  <button
                    key={sub.name}
                    onClick={() => {
                      setSelectedSubcategory(sub.name);
                      setSelectedSubtype(null);
                      setSelectedVariation(null);
                    }}
                    className={cn(
                      "flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                      selectedSubcategory === sub.name
                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20"
                    )}
                  >
                    {sub.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Level 3: Subtypes / Brands */}
          <AnimatePresence mode="wait">
            {selectedSubcategory && TAXONOMY.find(c => c.name === selectedCategory)?.subcategories.find(s => s.name === selectedSubcategory)?.subtypes && (
              <motion.div 
                key={`${selectedCategory}-${selectedSubcategory}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex gap-2 overflow-x-auto no-scrollbar py-1"
              >
                {TAXONOMY.find(c => c.name === selectedCategory)
                  ?.subcategories.find(s => s.name === selectedSubcategory)
                  ?.subtypes?.map(type => {
                    const typeName = typeof type === 'string' ? type : type.name;
                    const isSelected = selectedSubtype === typeName;
                    
                    return (
                      <button
                        key={typeName}
                        onClick={() => {
                          setSelectedSubtype(typeName);
                          setSelectedVariation(null);
                        }}
                        className={cn(
                          "flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all border",
                          isSelected
                            ? "bg-orange-500 border-orange-400 text-white shadow-[0_0_10px_rgba(249,115,22,0.3)] scale-105"
                            : "bg-white/5 border-white/10 text-zinc-500 hover:border-white/20"
                        )}
                      >
                        {typeName}
                      </button>
                    );
                  })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Level 4: Variations (if any) */}
          <AnimatePresence mode="wait">
            {selectedSubtype && (() => {
              const subcategory = TAXONOMY.find(c => c.name === selectedCategory)
                ?.subcategories.find(s => s.name === selectedSubcategory);
              const subtype = subcategory?.subtypes?.find(t => 
                (typeof t === 'string' ? t : t.name) === selectedSubtype
              );
              
              if (typeof subtype === 'object' && subtype.children) {
                return (
                  <motion.div 
                    key={`${selectedCategory}-${selectedSubcategory}-${selectedSubtype}`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="flex gap-2 overflow-x-auto no-scrollbar py-1"
                  >
                    {subtype.children.map(variation => (
                      <button
                        key={variation}
                        onClick={() => setSelectedVariation(variation)}
                        className={cn(
                          "flex-shrink-0 px-2 py-1 rounded-md text-[9px] font-bold transition-all border",
                          selectedVariation === variation
                            ? "bg-zinc-100 border-zinc-100 text-black shadow-lg scale-105"
                            : "bg-white/5 border-white/10 text-zinc-600 hover:border-white/20"
                        )}
                      >
                        {variation}
                      </button>
                    ))}
                  </motion.div>
                );
              }
              return null;
            })()}
          </AnimatePresence>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(selectedCategory || searchTerm) && (
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Filter size={16} />
            <span>Mostrando resultados para: </span>
            <div className="flex items-center gap-1">
              <span className="text-white font-bold">
                {searchTerm || selectedCategory}
              </span>
              {selectedSubcategory && (
                <>
                  <ChevronRight size={14} className="text-zinc-600" />
                  <span className="text-white font-bold">{selectedSubcategory}</span>
                </>
              )}
              {selectedSubtype && (
                <>
                  <ChevronRight size={14} className="text-zinc-600" />
                  <span className="text-white font-bold">{selectedSubtype}</span>
                </>
              )}
              {selectedVariation && (
                <>
                  <ChevronRight size={14} className="text-zinc-600" />
                  <span className="text-white font-bold">{selectedVariation}</span>
                </>
              )}
            </div>
          </div>
          <button 
            onClick={() => {
              setSelectedCategory(null);
              setSelectedSubcategory(null);
              setSelectedSubtype(null);
              setSelectedVariation(null);
              setSearchTerm('');
            }}
            className="text-xs font-bold text-orange-500 hover:underline"
          >
            Limpar Filtros
          </button>
        </div>
      )}

        {/* Quick Filters */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex gap-2">
            {[
              { id: 'featured', label: 'Destaque', icon: <Sparkles size={14} /> },
              { id: 'available', label: 'Disponível agora', icon: <CheckCircle2 size={14} /> },
              { id: 'freeShipping', label: 'Frete grátis', icon: <Truck size={14} /> },
              { id: 'nightService', label: 'Atende à noite', icon: <Moon size={14} /> },
              { id: 'is24h', label: '24h', icon: <Clock size={14} /> },
              { id: 'favorites', label: 'Favoritos', icon: <Heart size={14} /> },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id as keyof typeof activeFilters)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all whitespace-nowrap",
                  activeFilters[filter.id as keyof typeof activeFilters]
                    ? "bg-orange-600/20 border-orange-600 text-orange-500 shadow-lg shadow-orange-600/5"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20"
                )}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>
          
          {(Object.values(activeFilters).some(v => v) || selectedCategory || searchTerm) && (
            <button 
              onClick={() => {
                setActiveFilters({
                  featured: false,
                  available: false,
                  freeShipping: false,
                  nightService: false,
                  is24h: false,
                  favorites: false
                });
                setSelectedCategory(null);
                setSelectedSubcategory(null);
                setSelectedSubtype(null);
                setSelectedVariation(null);
                setSearchTerm('');
              }}
              className="text-[10px] font-bold text-orange-500 uppercase tracking-widest hover:underline whitespace-nowrap"
            >
              Limpar Filtros
            </button>
          )}
        </div>

      {/* Products Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))
          ) : filteredProducts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full py-20 text-center"
            >
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-zinc-700" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nenhum produto encontrado</h3>
              <p className="text-zinc-500">Tente ajustar sua busca ou filtro.</p>
            </motion.div>
          ) : filteredProducts.map((product) => {
            const cartItem = cart.find(item => item.product.id === product.id);
            const nextDiscount = getNextDiscount(product, cartItem?.quantity || 0);
            const maxDiscount = product.volume_discounts && product.volume_discounts.length > 0 
              ? Math.max(...product.volume_discounts.map(d => d.discount_percentage))
              : 0;
            const shipping = getEstimatedShipping(product.supplier as any);

            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={product.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "group bg-[#0A0A0A] border rounded-3xl p-4 transition-all relative flex flex-col h-full",
                  getCompanyPlan(product.supplier as any) === 'premium'
                    ? "border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.15)]"
                    : getCompanyPlan(product.supplier as any) === 'featured'
                    ? "border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]" 
                    : "border-white/10 hover:border-orange-600/30"
                )}
              >
              {maxDiscount > 0 && (
                <div className="absolute top-3 right-3 z-20">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-500 text-black text-[10px] font-black px-2 py-1 rounded-lg shadow-lg flex items-center gap-1"
                  >
                    <Zap size={10} fill="currentColor" />
                    OFERTA -{maxDiscount}%
                  </motion.div>
                </div>
              )}

              {getCompanyPlan(product.supplier as any) !== 'free' && (
              <div className={cn(
                "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg z-10 flex items-center gap-1",
                PLAN_CONFIG[getCompanyPlan(product.supplier as any)].bg
              )}>
                {getCompanyPlan(product.supplier as any) === 'premium' ? (
                  <span className="text-white flex items-center gap-1">
                    <span>🔥</span> Premium
                  </span>
                ) : (
                  <span className="text-black flex items-center gap-1">
                    <Star size={10} fill="currentColor" />
                    Destaque
                  </span>
                )}
              </div>
            )}
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
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
                className={cn(
                  "absolute top-3 right-3 z-30 p-2 rounded-xl backdrop-blur-md transition-all",
                  favorites.includes(product.id)
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                    : "bg-black/40 text-white hover:bg-black/60"
                )}
              >
                <Heart size={16} fill={favorites.includes(product.id) ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="flex-1 space-y-1 mb-4">
              <h3 className="font-bold text-lg leading-tight truncate">{product.name}</h3>
              <div className="flex flex-col gap-2 mb-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-zinc-500 truncate">Fornecido por: {product.supplier?.name}</p>
                  {product.supplier?.free_shipping_enabled && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                      <Truck size={10} />
                      <span>Frete Grátis</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    <span>{shipping.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={10} />
                    <span>Frete: {shipping.minFee === 0 ? 'Grátis' : formatCurrency(shipping.minFee)}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {product.brand && (
                    <span className="text-[9px] font-bold bg-white/5 text-zinc-400 px-2 py-0.5 rounded uppercase tracking-wider border border-white/5">
                      {product.brand}
                    </span>
                  )}
                  {product.subcategory && (
                    <span className="text-[9px] font-bold bg-white/5 text-zinc-400 px-2 py-0.5 rounded uppercase tracking-wider border border-white/5">
                      {product.subcategory}
                    </span>
                  )}
                  {product.unit_type && (
                    <span className="text-[9px] font-bold bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded uppercase tracking-wider border border-orange-500/20">
                      {product.unit_type === 'unit' ? 'Unitário' : product.unit_type === 'pack' ? 'Pack' : 'Caixa'}
                    </span>
                  )}
                </div>

                {product.volume_discounts && product.volume_discounts.length > 0 && (
                  <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-2 space-y-1">
                    {product.volume_discounts.map((d, i) => (
                      <div key={i} className="text-[9px] font-bold text-green-500 flex items-center gap-1">
                        <Sparkles size={10} />
                        {d.min_quantity}+ un: -{d.discount_percentage}% desc.
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col">
                  {maxDiscount > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 line-through decoration-zinc-600">
                        {formatCurrency(product.price)}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-white">
                          {formatCurrency(product.price * (1 - maxDiscount / 100))}
                        </span>
                        <span className="text-[9px] text-emerald-500 font-bold uppercase">
                          A partir de
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xl font-black text-white">{formatCurrency(product.price)}</span>
                  )}
                  {product.supplier?.free_shipping_enabled ? (
                    <span className="text-[9px] text-emerald-500 font-bold uppercase">
                      Frete Grátis {product.supplier.free_shipping_min_value ? `+ ${formatCurrency(product.supplier.free_shipping_min_value)}` : ''}
                    </span>
                  ) : (
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">
                      Frete sob consulta
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Estoque: {product.stock_quantity}</span>
                  {product.min_quantity > 1 && (
                    <span className="text-[9px] text-orange-500/70 font-bold uppercase block">Mín: {product.min_quantity} un</span>
                  )}
                </div>
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
            );
          })}
        </AnimatePresence>
      </motion.div>

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
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) {
                  setIsCartOpen(false);
                }
              }}
              className="fixed bottom-0 left-0 right-0 w-full max-w-2xl mx-auto bg-[#0A0A0A] border-t border-white/10 z-[101] flex flex-col rounded-t-[32px] max-h-[92vh] shadow-2xl overflow-hidden"
            >
              {/* Drag Handle */}
              <div className="pt-3 pb-1 flex justify-center">
                <div className="w-12 h-1.5 bg-white/10 rounded-full" />
              </div>

              <div className="p-6 pt-2 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <ShoppingCart size={24} className="text-orange-500" />
                  Seu Carrinho
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
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
                        <h4 className="font-bold truncate text-lg">{item.product.name}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm text-zinc-500">
                            {formatCurrency(getProductPrice(item.product, item.quantity))}
                            <span className="text-[10px] ml-1">/ un</span>
                          </p>
                          {item.product.unit_type && (
                            <span className="text-[10px] font-bold bg-white/5 text-zinc-500 px-1.5 py-0.5 rounded uppercase border border-white/5">
                              {item.product.unit_type === 'unit' ? 'Un' : item.product.unit_type === 'pack' ? 'Pack' : 'Cx'}
                            </span>
                          )}
                        </div>

                        {/* Volume Discount Indicator & Progress Bar */}
                        {item.product.volume_discounts && item.product.volume_discounts.length > 0 && (
                          <div className="mb-3 space-y-2">
                            {(() => {
                              const sortedDiscounts = [...item.product.volume_discounts].sort((a, b) => b.min_quantity - a.min_quantity);
                              const currentDiscount = sortedDiscounts.find(d => item.quantity >= d.min_quantity);
                              const nextDiscount = [...sortedDiscounts].reverse().find(d => item.quantity < d.min_quantity);
                              
                              return (
                                <>
                                  {currentDiscount && (
                                    <div className="text-[10px] font-bold text-green-500 flex items-center gap-1 mb-1">
                                      <Sparkles size={10} />
                                      Desconto de {currentDiscount.discount_percentage}% aplicado!
                                    </div>
                                  )}
                                  {nextDiscount && (
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between text-[9px] font-bold">
                                        <span className="text-zinc-500 uppercase tracking-widest">Próximo Nível</span>
                                        <span className="text-orange-500">-{nextDiscount.discount_percentage}%</span>
                                      </div>
                                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${(item.quantity / nextDiscount.min_quantity) * 100}%` }}
                                          className="h-full bg-orange-600 rounded-full"
                                        />
                                      </div>
                                      <div className="text-[9px] font-bold text-orange-500/70 flex items-center gap-1">
                                        <Info size={10} />
                                        + {nextDiscount.min_quantity - item.quantity} un para {nextDiscount.discount_percentage}% desc.
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-bold text-lg w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                          <button 
                            onClick={() => removeFromCart(item.product.id)}
                            className="ml-auto p-2 text-zinc-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-[#050505] space-y-4">
                  {/* Supplier Availability Status */}
                  {cart[0].product.supplier && (
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold",
                      STATUS_CONFIG[getSupplierStatus(cart[0].product.supplier)].bg,
                      STATUS_CONFIG[getSupplierStatus(cart[0].product.supplier)].text,
                      STATUS_CONFIG[getSupplierStatus(cart[0].product.supplier)].border
                    )}>
                      <span>{STATUS_CONFIG[getSupplierStatus(cart[0].product.supplier)].icon}</span>
                      <span>{STATUS_CONFIG[getSupplierStatus(cart[0].product.supplier)].label}</span>
                    </div>
                  )}

                  {cart[0].product.supplier?.accepts_after_hours && (
                    <div className="p-3 bg-emerald-600/10 border border-emerald-600/20 rounded-xl flex items-start gap-3">
                      <Info size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-emerald-500/90 leading-relaxed">
                        Este fornecedor aceita pedidos fora do horário comercial. Seu pedido será processado na próxima janela de atendimento.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-zinc-400 text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))}</span>
                    </div>
                    {totalSavings > 0 && (
                      <div className="flex items-center justify-between text-emerald-500 text-sm font-bold">
                        <span>Descontos Aplicados</span>
                        <span>-{formatCurrency(totalSavings)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-zinc-400 text-sm">
                      <div className="flex items-center gap-2">
                        <span>Frete</span>
                        {shippingDetails?.vehicleType && (
                          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded uppercase font-bold text-zinc-500">
                            {shippingDetails.vehicleType}
                          </span>
                        )}
                      </div>
                      {calculatingShipping ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : shippingDetails?.isFreeShipping ? (
                        <span className="text-emerald-500 font-bold">Grátis</span>
                      ) : (
                        <span>{formatCurrency(shippingDetails?.deliveryFee || 0)}</span>
                      )}
                    </div>
                    {shippingDetails?.isFreeShipping && (
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                        Frete grátis aplicado pela loja
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xl font-bold pt-2 border-t border-white/5">
                    <span>Total</span>
                    <span className="text-white">
                      {formatCurrency(shippingDetails ? shippingDetails.total : cartTotal)}
                    </span>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Forma de Pagamento</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => setPaymentMethod('pix')}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                          paymentMethod === 'pix' ? "bg-orange-600/10 border-orange-600 text-orange-500" : "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10"
                        )}
                      >
                        <QrCode size={20} />
                        <span className="text-[10px] font-bold uppercase">Pix</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                          paymentMethod === 'card' ? "bg-orange-600/10 border-orange-600 text-orange-500" : "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10"
                        )}
                      >
                        <Star size={20} />
                        <span className="text-[10px] font-bold uppercase">Cartão</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                          paymentMethod === 'cash' ? "bg-orange-600/10 border-orange-600 text-orange-500" : "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10"
                        )}
                      >
                        <DollarSign size={20} />
                        <span className="text-[10px] font-bold uppercase">Dinheiro</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('mercado_pago')}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all opacity-50 cursor-not-allowed",
                          paymentMethod === 'mercado_pago' ? "bg-orange-600/10 border-orange-600 text-orange-500" : "bg-white/5 border-white/5 text-zinc-500"
                        )}
                      >
                        <CreditCard size={20} />
                        <span className="text-[10px] font-bold uppercase">M. Pago</span>
                      </button>
                    </div>

                    {paymentMethod === 'cash' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Troco para quanto?</label>
                        <input
                          type="number"
                          value={changeFor}
                          onChange={(e) => setChangeFor(e.target.value)}
                          placeholder="Ex: 100"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all text-sm"
                        />
                        <p className="text-[10px] text-zinc-500 italic ml-1">Deixe em branco se não precisar de troco.</p>
                      </motion.div>
                    )}

                    {paymentMethod === 'card' && (
                      <p className="text-[10px] text-zinc-500 italic text-center">
                        O pagamento será realizado na maquininha no momento da entrega.
                      </p>
                    )}
                  </div>
                  
                  <button 
                    disabled={isCheckingOut || calculatingShipping}
                    onClick={handleCheckout}
                    className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50 flex items-center justify-between px-6"
                  >
                    {isCheckingOut ? (
                      <div className="flex items-center gap-2 mx-auto">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processando...</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-lg">Finalizar pedido</span>
                        <div className="flex items-center gap-3">
                          <span className="w-px h-5 bg-white/20" />
                          <span className="text-lg font-black tracking-tight">
                            {formatCurrency(shippingDetails ? shippingDetails.total : cartTotal)}
                          </span>
                        </div>
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
                    {currentOrder.payment_method === 'pix' ? <QrCode size={24} /> : 
                     currentOrder.payment_method === 'card' ? <Star size={24} /> : <DollarSign size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {currentOrder.payment_method === 'pix' ? 'Pagamento Pix' : 
                       currentOrder.payment_method === 'card' ? 'Pagamento no Cartão' : 'Pagamento em Dinheiro'}
                    </h3>
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
                  <div className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2",
                    currentOrder.payment_method === 'pix' 
                      ? "bg-orange-600/10 border border-orange-600/20 text-orange-500 animate-pulse"
                      : "bg-emerald-600/10 border border-emerald-600/20 text-emerald-500"
                  )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      currentOrder.payment_method === 'pix' ? "bg-orange-500" : "bg-emerald-500"
                    )} />
                    {currentOrder.payment_method === 'pix' ? 'Aguardando Pagamento' : 'Pedido Confirmado'}
                  </div>
                </div>

                {currentOrder.payment_method === 'pix' ? (
                  <>
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
                  </>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-20 h-20 bg-emerald-600/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                      <CheckCircle2 size={48} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">Tudo certo!</h4>
                      <p className="text-zinc-500 text-sm">
                        Seu pedido foi enviado para o fornecedor. 
                        O pagamento será realizado no momento da entrega.
                      </p>
                    </div>
                    {currentOrder.change_for && (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Troco para</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(currentOrder.change_for)}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Amount */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-zinc-400">Valor Total</span>
                  <span className="text-2xl font-bold text-orange-500">
                    {formatCurrency(currentOrder.total_amount)}
                  </span>
                </div>

                {/* Supplier Info */}
                <div className="p-4 rounded-2xl bg-orange-600/5 border border-orange-600/10 space-y-3">
                  <div className="flex items-center gap-2 text-orange-500 font-bold text-sm">
                    <Info size={16} />
                    <span>Dados do Recebedor</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-zinc-500 mb-1 uppercase tracking-widest text-[10px] font-bold">Recebedor</p>
                      <p className="font-bold text-white text-sm">{currentOrder.supplier?.pix_recipient_name || currentOrder.supplier?.name}</p>
                    </div>
                    {currentOrder.payment_method === 'pix' && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-zinc-500 mb-1 uppercase tracking-widest text-[10px] font-bold">Chave Pix</p>
                        <p className="font-bold text-white text-sm truncate">{currentOrder.supplier?.pix_key}</p>
                      </div>
                    )}
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
      {/* Fixed Bottom Cart Button */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: lastAddedId ? [1, 1.05, 1] : 1
            }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ 
              scale: { duration: 0.3, ease: "easeOut" },
              y: { type: "spring", damping: 20, stiffness: 100 }
            }}
            className="fixed bottom-4 left-4 right-4 z-50 pb-[env(safe-area-inset-bottom)]"
          >
            <motion.button
              onClick={() => setIsCartOpen(true)}
              animate={lastAddedId ? {
                boxShadow: ["0 8px 30px rgb(234,88,12,0.3)", "0 8px 40px rgb(234,88,12,0.6)", "0 8px 30px rgb(234,88,12,0.3)"]
              } : {}}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-between transition-all shadow-[0_8px_30px_rgb(234,88,12,0.3)] active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart size={24} />
                  <AnimatePresence mode="popLayout">
                    <motion.span 
                      key={cartCount}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      className="absolute -top-2 -right-2 bg-white text-orange-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                    >
                      {cartCount}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className="text-lg">Carrinho</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-6 w-px bg-white/20" />
                <span className="text-lg font-black tracking-tight">
                  {formatCurrency(shippingDetails ? shippingDetails.total : cartTotal)}
                </span>
                <ChevronRight size={20} />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
