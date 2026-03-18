import { useState, useEffect } from 'react';
import { supabase, type Order } from '../lib/supabase';
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
  Phone
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Delivery {
  id: string;
  order_id: string;
  driver_id: string | null;
  status: string;
  created_at: string;
  order?: {
    total_amount: number;
    retailer: {
      name: string;
      address: string;
      whatsapp: string;
      responsible_name: string;
    }
  }
}

export default function Deliveries() {
  const { profile } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
        .select('*, order:orders(total_amount, retailer:companies(name, address, whatsapp, responsible_name))')
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
                      <div className="w-12 h-12 rounded-xl bg-orange-600/10 flex items-center justify-center">
                        <Package className="text-orange-500" size={24} />
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
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Valor do Pedido</p>
                        <p className="text-2xl font-black text-white">{formatCurrency(delivery.order?.total_amount || 0)}</p>
                        <div className="flex gap-2 mt-4">
                          <a 
                            href={`https://wa.me/55${delivery.order?.retailer.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-green-600/10 hover:bg-green-600/20 text-green-500 rounded-lg text-xs font-bold transition-all"
                          >
                            <Phone size={14} />
                            WhatsApp
                          </a>
                          <button 
                            onClick={() => toast.info('Mapa em desenvolvimento')}
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
                  {delivery.status === 'aguardando entregador' && profile?.role === 'driver' && (
                    <button 
                      disabled={updatingId === delivery.id}
                      onClick={() => acceptDelivery(delivery.id)}
                      className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updatingId === delivery.id ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Aceitar Entrega'}
                    </button>
                  )}

                  {delivery.status === 'aceita' && profile?.role === 'driver' && (
                    <button 
                      disabled={updatingId === delivery.id}
                      onClick={() => updateStatus(delivery.id, 'em coleta')}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updatingId === delivery.id ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Iniciar Coleta'}
                    </button>
                  )}

                  {delivery.status === 'em coleta' && profile?.role === 'driver' && (
                    <button 
                      disabled={updatingId === delivery.id}
                      onClick={() => updateStatus(delivery.id, 'saiu para entrega')}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updatingId === delivery.id ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Saiu para Entrega'}
                    </button>
                  )}

                  {delivery.status === 'saiu para entrega' && profile?.role === 'driver' && (
                    <button 
                      disabled={updatingId === delivery.id}
                      onClick={() => updateStatus(delivery.id, 'entregue')}
                      className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updatingId === delivery.id ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirmar Entrega'}
                    </button>
                  )}

                  <button 
                    onClick={() => toast.info('Detalhes do pedido em desenvolvimento')}
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
    </div>
  );
}
