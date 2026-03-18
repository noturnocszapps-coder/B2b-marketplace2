import { useState, useEffect } from 'react';
import { supabase, type Order } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingCart, 
  ChevronRight,
  ChevronDown,
  FileText,
  Printer,
  Package,
  Truck,
  RefreshCw,
  QrCode,
  Copy,
  ExternalLink,
  X,
  Info
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

export default function Orders() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      fetchOrders();
    }
  }, [profile]);

  async function fetchOrders() {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*, retailer:companies(name, responsible_name, whatsapp), items:order_items(*, product:products(name, image_url, supplier:companies(name, pix_key, pix_recipient_name, address, whatsapp)))')
        .order('created_at', { ascending: false });

      if (profile?.role === 'retailer') {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('profile_id', profile.id)
          .maybeSingle();
        
        if (companyError) throw companyError;
        
        if (company) {
          query = query.eq('retailer_id', company.id);
        } else {
          // If no company found for retailer, they should see no orders
          setOrders([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar pedidos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!confirm(`Deseja alterar o status do pedido para ${newStatus}?`)) return;
    
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Status do pedido atualizado!');
      fetchOrders();
    } catch (error: any) {
      toast.error('Erro ao atualizar status: ' + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguardando pagamento': return 'bg-orange-500/10 text-orange-500';
      case 'pendente': return 'bg-zinc-500/10 text-zinc-500';
      case 'pago': return 'bg-green-500/10 text-green-500';
      case 'em entrega': return 'bg-blue-500/10 text-blue-500';
      case 'entregue': return 'bg-emerald-500/10 text-emerald-500';
      case 'cancelado': return 'bg-red-500/10 text-red-500';
      default: return 'bg-zinc-500/10 text-zinc-500';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.retailer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['aguardando pagamento', 'pendente', 'pago', 'em entrega', 'entregue', 'cancelado'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Histórico de Pedidos</h1>
          <p className="text-zinc-500">Acompanhe o status e detalhes de todas as transações.</p>
        </div>
        <button 
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-zinc-400 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={18} className={cn(loading && "animate-spin")} />
          Atualizar Lista
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input 
            type="text"
            placeholder="Buscar por número do pedido ou lojista..."
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button 
            onClick={() => setStatusFilter(null)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-lg border transition-all text-xs font-bold uppercase tracking-wider",
              !statusFilter ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-zinc-500 hover:text-white"
            )}
          >
            Todos
          </button>
          {statuses.map(status => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-lg border transition-all text-xs font-bold uppercase tracking-wider",
                statusFilter === status ? "bg-orange-600 border-orange-600 text-white" : "bg-white/5 border-white/10 text-zinc-500 hover:text-white"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading && orders.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">Carregando pedidos...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-3xl">
            <ShoppingCart size={48} className="mx-auto text-zinc-800 mb-4" />
            <h3 className="text-lg font-bold">Nenhum pedido encontrado</h3>
            <p className="text-zinc-500">Tente ajustar seus filtros ou busca.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div 
              key={order.id}
              className={cn(
                "group bg-[#0A0A0A] border transition-all overflow-hidden",
                expandedOrderId === order.id ? "border-orange-600/50 rounded-3xl" : "border-white/10 rounded-2xl hover:border-white/20"
              )}
            >
              <div 
                className="p-6 cursor-pointer"
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      expandedOrderId === order.id ? "bg-orange-600/20 text-orange-500" : "bg-zinc-900 text-zinc-500"
                    )}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">#{order.id.slice(0, 8).toUpperCase()}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          getStatusColor(order.status)
                        )}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-500">
                        {format(new Date(order.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1 lg:max-w-2xl">
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">Lojista</span>
                      <span className="font-semibold truncate">{order.retailer?.name}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">Total</span>
                      <span className="text-lg font-black text-white">{formatCurrency(order.total_amount)}</span>
                    </div>

                    <div className="hidden md:flex flex-col">
                      <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">Itens</span>
                      <span className="font-semibold">{order.items?.length || 0} produtos</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info('Impressão em desenvolvimento');
                      }}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-zinc-400 hover:text-white"
                    >
                      <Printer size={20} />
                    </button>
                    <div className={cn(
                      "p-3 rounded-xl transition-all",
                      expandedOrderId === order.id ? "bg-orange-600 text-white" : "bg-white/5 text-zinc-400"
                    )}>
                      {expandedOrderId === order.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedOrderId === order.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 bg-white/[0.02]"
                  >
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                            <Package size={16} />
                            Itens do Pedido
                          </h4>
                          <div className="space-y-3">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-zinc-900 rounded-lg overflow-hidden">
                                    {item.product?.image_url ? (
                                      <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center"><Package size={16} /></div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-sm">{item.product?.name}</div>
                                    <div className="text-xs text-zinc-500">{item.quantity} un x {formatCurrency(item.price_at_purchase)}</div>
                                  </div>
                                </div>
                                <div className="font-bold">{formatCurrency(item.quantity * item.price_at_purchase)}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                              <Truck size={16} />
                              Informações de Entrega
                            </h4>
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Status</span>
                                <span className="font-bold capitalize">{order.status}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Lojista Responsável</span>
                                <span className="font-bold">{order.retailer?.responsible_name}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                              <AlertCircle size={16} />
                              Pagamento (Pix)
                            </h4>
                            <div className="bg-orange-600/10 border border-orange-600/20 p-4 rounded-xl">
                              <p className="text-xs text-orange-500 font-bold mb-2 uppercase tracking-wider">Pagamento via Pix</p>
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                  <code className="block bg-black/40 p-3 rounded-lg text-xs font-mono break-all text-zinc-300 border border-white/5 mb-2">
                                    {order.pix_code}
                                  </code>
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(order.pix_code);
                                      toast.success('Código Pix copiado!');
                                    }}
                                    className="text-xs font-bold text-orange-500 hover:underline flex items-center gap-1"
                                  >
                                    <Copy size={12} />
                                    Copiar Código
                                  </button>
                                </div>
                                {order.status === 'aguardando pagamento' && (
                                  <button 
                                    onClick={() => {
                                      // Find supplier info from the first item
                                      const supplier = order.items?.[0]?.product?.supplier;
                                      setCurrentOrder({ ...order, supplier });
                                      setShowPaymentModal(true);
                                    }}
                                    className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2"
                                  >
                                    <QrCode size={16} />
                                    Pagar Agora
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {(profile?.role === 'admin' || profile?.role === 'supplier') && (
                            <div className="space-y-4">
                              <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                                <RefreshCw size={16} />
                                Ações do Pedido
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {order.status === 'aguardando pagamento' && (
                                  <button 
                                    disabled={updatingId === order.id}
                                    onClick={() => updateOrderStatus(order.id, 'pendente')}
                                    className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                  >
                                    Marcar como Pendente
                                  </button>
                                )}
                                {(order.status === 'pendente' || order.status === 'aguardando pagamento') && (
                                  <button 
                                    disabled={updatingId === order.id}
                                    onClick={() => updateOrderStatus(order.id, 'pago')}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                  >
                                    Confirmar Pagamento
                                  </button>
                                )}
                                {order.status === 'pago' && (
                                  <button 
                                    disabled={updatingId === order.id}
                                    onClick={() => updateOrderStatus(order.id, 'em entrega')}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                  >
                                    Liberar para Entrega
                                  </button>
                                )}
                                {order.status !== 'cancelado' && order.status !== 'entregue' && (
                                  <button 
                                    disabled={updatingId === order.id}
                                    onClick={() => updateOrderStatus(order.id, 'cancelado')}
                                    className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                  >
                                    Cancelar Pedido
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

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
                  onClick={() => setShowPaymentModal(false)}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all flex items-center justify-center gap-2"
                >
                  Fechar
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
