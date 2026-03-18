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
  RefreshCw
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function Orders() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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
        .select('*, retailer:companies(name, responsible_name), items:order_items(*, product:products(name, image_url))')
        .order('created_at', { ascending: false });

      if (profile?.role === 'retailer') {
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('profile_id', profile.id)
          .single();
        if (company) query = query.eq('retailer_id', company.id);
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
      case 'pendente': return 'bg-zinc-500/10 text-zinc-500';
      case 'pago': return 'bg-green-500/10 text-green-500';
      case 'em entrega': return 'bg-blue-500/10 text-blue-500';
      case 'entregue': return 'bg-emerald-500/10 text-emerald-500';
      case 'cancelado': return 'bg-red-500/10 text-red-500';
      default: return 'bg-orange-500/10 text-orange-500';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.retailer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['pendente', 'pago', 'em entrega', 'entregue', 'cancelado'];

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
                              <p className="text-xs text-orange-500 font-bold mb-2 uppercase tracking-wider">Código Pix para Pagamento</p>
                              <code className="block bg-black/40 p-3 rounded-lg text-xs font-mono break-all text-zinc-300 border border-white/5">
                                {order.pix_code}
                              </code>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(order.pix_code);
                                  toast.success('Código Pix copiado!');
                                }}
                                className="mt-3 text-xs font-bold text-orange-500 hover:underline"
                              >
                                Copiar Código
                              </button>
                            </div>
                          </div>

                          {(profile?.role === 'admin' || profile?.role === 'supplier') && (
                            <div className="space-y-4">
                              <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                                <RefreshCw size={16} />
                                Ações do Pedido
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {order.status === 'pendente' && (
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
    </div>
  );
}
