import { useState, useEffect } from 'react';
import { supabase, type Delivery } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Navigation,
  Package,
  ChevronRight,
  MessageCircle,
  ExternalLink,
  Phone,
  X,
  Info,
  DollarSign
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Deliveries() {
  const { profile } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  useEffect(() => {
    if (profile) {
      fetchDeliveries();
    }
  }, [profile]);

  async function fetchDeliveries() {
    setLoading(true);
    try {
      let query = supabase
        .from('deliveries')
        .select(`
          *,
          order:orders(
            *,
            retailer:companies!retailer_id(*),
            items:order_items(
              *,
              product:products(*)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (profile?.role === 'driver') {
        const { data: driver } = await supabase
          .from('delivery_drivers')
          .select('id')
          .eq('profile_id', profile.id)
          .single();
        
        if (driver) {
          query = query.or(`driver_id.eq.${driver.id},status.eq.aguardando entregador`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setDeliveries(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar entregas: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const acceptDelivery = async (deliveryId: string) => {
    setUpdatingId(deliveryId);
    try {
      const { data: driver } = await supabase
        .from('delivery_drivers')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (!driver) throw new Error('Perfil de motorista não encontrado');

      const { error } = await supabase
        .from('deliveries')
        .update({ 
          driver_id: driver.id,
          status: 'aceita',
          accepted_at: new Date().toISOString()
        })
        .eq('id', deliveryId);

      if (error) throw error;
      toast.success('Entrega aceita com sucesso!');
      fetchDeliveries();
    } catch (error: any) {
      toast.error('Erro ao aceitar entrega: ' + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateStatus = async (deliveryId: string, newStatus: string) => {
    if (newStatus === 'entregue' && !confirm('Confirmar a entrega deste pedido?')) return;
    
    setUpdatingId(deliveryId);
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ status: newStatus })
        .eq('id', deliveryId);

      if (error) throw error;
      toast.success(`Status atualizado para: ${newStatus}`);
      fetchDeliveries();
    } catch (error: any) {
      toast.error('Erro ao atualizar status: ' + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const openMap = (address: string) => {
    if (!address) {
      toast.error('Endereço não disponível');
      return;
    }
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'aguardando entregador': return { color: 'bg-yellow-500/10 text-yellow-500', icon: Clock };
      case 'aceita': return { color: 'bg-blue-500/10 text-blue-500', icon: CheckCircle2 };
      case 'em coleta': return { color: 'bg-indigo-500/10 text-indigo-500', icon: Package };
      case 'saiu para entrega': return { color: 'bg-purple-500/10 text-purple-500', icon: Truck };
      case 'entregue': return { color: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle2 };
      case 'falhou': return { color: 'bg-red-500/10 text-red-500', icon: AlertCircle };
      default: return { color: 'bg-zinc-500/10 text-zinc-500', icon: Clock };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Entregas</h1>
          <p className="text-zinc-500">Acompanhe e realize as entregas dos pedidos.</p>
        </div>
        <button 
          onClick={fetchDeliveries}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-zinc-400 hover:text-white"
        >
          Atualizar Lista
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading && deliveries.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">Carregando entregas...</div>
        ) : deliveries.length === 0 ? (
          <div className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-3xl">
            <Truck size={48} className="mx-auto text-zinc-800 mb-4" />
            <h3 className="text-lg font-bold">Nenhuma entrega disponível</h3>
            <p className="text-zinc-500">Novos pedidos aparecerão aqui em breve.</p>
          </div>
        ) : (
          deliveries.map((delivery) => {
            const statusInfo = getStatusInfo(delivery.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div 
                key={delivery.id}
                className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 lg:p-8 flex flex-col lg:flex-row gap-8 hover:border-white/20 transition-all"
              >
                <div className="flex-1 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-orange-600/10 flex items-center justify-center relative">
                        <Package className="text-orange-500" size={24} />
                        {delivery.vehicle_type && (
                          <div className="absolute -bottom-1 -right-1 bg-zinc-900 border border-white/10 rounded-md px-1 py-0.5 text-[8px] font-black uppercase text-zinc-400">
                            {delivery.vehicle_type}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Entrega #{delivery.id.slice(0, 8).toUpperCase()}</h3>
                        <p className="text-sm text-zinc-500">Pedido em {format(new Date(delivery.created_at), "dd/MM/yyyy HH:mm")}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit",
                      statusInfo.color
                    )}>
                      <StatusIcon size={14} />
                      {delivery.status}
                    </div>
                    {delivery.is_free_shipping && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider w-fit">
                        <DollarSign size={12} />
                        Frete Grátis
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0">
                        <MapPin className="text-zinc-500" size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Destino</p>
                        <p className="font-bold text-lg">{delivery.order?.retailer.name}</p>
                        <p className="text-sm text-zinc-400 leading-relaxed">{delivery.order?.retailer.address}</p>
                        <div className="flex items-center gap-2 mt-2 text-zinc-500 text-sm">
                          <MessageCircle size={14} />
                          {delivery.order?.retailer.responsible_name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0">
                        <Navigation className="text-zinc-500" size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Valores</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">Ganhos:</span>
                            <span className="text-lg font-bold text-emerald-500">{formatCurrency(delivery.driver_payout || 0)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">Pedido:</span>
                            <span className="text-sm font-medium text-zinc-300">{formatCurrency(delivery.order?.total_amount || 0)}</span>
                          </div>
                          {delivery.distance_km > 0 && (
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                              <Navigation size={10} />
                              <span>{delivery.distance_km.toFixed(1)} km</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <a 
                            href={`https://wa.me/55${delivery.order?.retailer?.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-green-600/10 hover:bg-green-600/20 text-green-500 rounded-lg text-xs font-bold transition-all"
                          >
                            <Phone size={14} />
                            WhatsApp
                          </a>
                          <button 
                            onClick={() => openMap(delivery.order?.retailer?.address || '')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-lg text-xs font-bold transition-all"
                          >
                            <ExternalLink size={14} />
                            Ver Mapa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:w-64 flex flex-col justify-center gap-3">
                  {delivery.status === 'aguardando entregador' && (profile?.role === 'driver' || profile?.role === 'admin') && (
                    <button 
                      disabled={updatingId === delivery.id}
                      onClick={() => {
                        if (profile?.role === 'admin') {
                          updateStatus(delivery.id, 'aceita');
                        } else {
                          acceptDelivery(delivery.id);
                        }
                      }}
                      className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updatingId === delivery.id ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Aceitar Entrega'}
                    </button>
                  )}

                  {delivery.status === 'aceita' && (profile?.role === 'driver' || profile?.role === 'admin') && (
                    <button 
                      disabled={updatingId === delivery.id}
                      onClick={() => updateStatus(delivery.id, 'em coleta')}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updatingId === delivery.id ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Iniciar Coleta'}
                    </button>
                  )}

                  {delivery.status === 'em coleta' && (profile?.role === 'driver' || profile?.role === 'admin') && (
                    <button 
                      disabled={updatingId === delivery.id}
                      onClick={() => updateStatus(delivery.id, 'saiu para entrega')}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updatingId === delivery.id ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Saiu para Entrega'}
                    </button>
                  )}

                  {delivery.status === 'saiu para entrega' && (profile?.role === 'driver' || profile?.role === 'admin') && (
                    <button 
                      disabled={updatingId === delivery.id}
                      onClick={() => updateStatus(delivery.id, 'entregue')}
                      className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updatingId === delivery.id ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirmar Entrega'}
                    </button>
                  )}

                  <button 
                    onClick={() => setSelectedDelivery(delivery)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Package size={16} />
                    Detalhes do Pedido
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedDelivery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-orange-600/10 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/20">
                    <Package className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Pedido #{selectedDelivery.order?.id.slice(0, 8).toUpperCase()}</h2>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Detalhes da Entrega</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDelivery(null)}
                  className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-zinc-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Status and Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Clock size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Status Atual</span>
                    </div>
                    <div className={cn(
                      "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest w-fit",
                      getStatusInfo(selectedDelivery.status).color
                    )}>
                      {selectedDelivery.status}
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <DollarSign size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Ganhos do Motorista</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-500">
                      {formatCurrency(selectedDelivery.driver_payout || 0)}
                    </div>
                    {selectedDelivery.is_free_shipping && (
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                        Frete pago pelo fornecedor
                      </p>
                    )}
                  </div>
                </div>

                {/* Retailer Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={16} />
                    Dados do Cliente
                  </h3>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                    <div>
                      <p className="text-xl font-bold">{selectedDelivery.order?.retailer?.name}</p>
                      <p className="text-zinc-400 text-sm mt-1">{selectedDelivery.order?.retailer?.address}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <MessageCircle size={16} className="text-zinc-600" />
                        {selectedDelivery.order?.retailer?.responsible_name}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Phone size={16} className="text-zinc-600" />
                        {selectedDelivery.order?.retailer?.whatsapp}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Package size={16} />
                    Itens do Pedido
                  </h3>
                  <div className="space-y-3">
                    {selectedDelivery.order?.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-zinc-900 overflow-hidden border border-white/5">
                            <img 
                              src={item.product?.image_url || 'https://picsum.photos/seed/product/200'} 
                              alt={item.product?.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{item.product?.name}</p>
                            <p className="text-xs text-zinc-500">{item.quantity}x {formatCurrency(item.price_at_purchase)}</p>
                          </div>
                        </div>
                        <p className="font-bold text-sm">{formatCurrency(item.quantity * item.price_at_purchase)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="p-6 rounded-3xl bg-orange-600/5 border border-orange-600/10 space-y-3">
                  <div className="flex justify-between text-sm text-zinc-400">
                    <span>Subtotal Produtos</span>
                    <span>{formatCurrency(selectedDelivery.order?.total_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-zinc-400">
                    <span>Taxa de Entrega</span>
                    {selectedDelivery.is_free_shipping ? (
                      <span className="text-emerald-500 font-bold">Grátis</span>
                    ) : (
                      <span>{formatCurrency(selectedDelivery.delivery_fee || 0)}</span>
                    )}
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/10">
                    <span className="font-bold text-white">Total Geral</span>
                    <span className="font-black text-xl text-white">
                      {formatCurrency(selectedDelivery.order?.total_amount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-zinc-900/50 border-t border-white/10">
                <button 
                  onClick={() => setSelectedDelivery(null)}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all"
                >
                  Fechar Detalhes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
