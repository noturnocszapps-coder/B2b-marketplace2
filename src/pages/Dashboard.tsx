import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { formatCurrency, cn } from '../lib/utils';
import { toast } from 'sonner';

const mockChartData = [
  { name: 'Seg', sales: 4000, orders: 24 },
  { name: 'Ter', sales: 3000, orders: 18 },
  { name: 'Qua', sales: 2000, orders: 15 },
  { name: 'Qui', sales: 2780, orders: 20 },
  { name: 'Sex', sales: 1890, orders: 12 },
  { name: 'Sáb', sales: 2390, orders: 16 },
  { name: 'Dom', sales: 3490, orders: 22 },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Fetch stats based on role
      if (profile?.role === 'admin') {
        const [usersCount, ordersCount, productsCount] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          totalUsers: usersCount.count || 0,
          totalOrders: ordersCount.count || 0,
          totalProducts: productsCount.count || 0,
          revenue: 12450.80 // Mock for now
        });
      } else if (profile?.role === 'supplier') {
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('profile_id', profile.id)
          .single();

        if (company) {
          const [productsCount, ordersCount] = await Promise.all([
            supabase.from('products').select('*', { count: 'exact', head: true }).eq('supplier_id', company.id),
            supabase.from('order_items').select('order_id', { count: 'exact', head: true }).eq('product:products(supplier_id)', company.id),
          ]);
          
          setStats({
            myProducts: productsCount.count || 0,
            activeOrders: ordersCount.count || 0,
            revenue: 8540.00
          });
        }
      } else if (profile?.role === 'retailer') {
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('profile_id', profile.id)
          .single();

        if (company) {
          const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('retailer_id', company.id);

          setStats({
            myOrders: count || 0,
            totalSpent: 3240.50
          });
        }
      } else if (profile?.role === 'driver') {
        const { data: driver } = await supabase
          .from('delivery_drivers')
          .select('id')
          .eq('profile_id', profile.id)
          .single();

        if (driver) {
          const { count } = await supabase
            .from('deliveries')
            .select('*', { count: 'exact', head: true })
            .eq('driver_id', driver.id);

          setStats({
            myDeliveries: count || 0,
            completed: 15
          });
        }
      }

      // Fetch recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*, retailer:companies(name)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentOrders(orders || []);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-xl", color)}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trend > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}>
            {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-zinc-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  );

  const renderStats = () => {
    switch (profile?.role) {
      case 'admin':
        return (
          <>
            <StatCard title="Vendas Totais" value={formatCurrency(stats.revenue || 0)} icon={DollarSign} trend={12.5} color="bg-orange-600" />
            <StatCard title="Pedidos Ativos" value={stats.totalOrders || 0} icon={ShoppingCart} trend={-2.4} color="bg-blue-600" />
            <StatCard title="Usuários Totais" value={stats.totalUsers || 0} icon={Users} trend={8.1} color="bg-purple-600" />
            <StatCard title="Produtos Cadastrados" value={stats.totalProducts || 0} icon={Package} color="bg-zinc-600" />
          </>
        );
      case 'supplier':
        return (
          <>
            <StatCard title="Minhas Vendas" value={formatCurrency(stats.revenue || 0)} icon={DollarSign} trend={15.2} color="bg-orange-600" />
            <StatCard title="Pedidos Ativos" value={stats.activeOrders || 0} icon={ShoppingCart} color="bg-blue-600" />
            <StatCard title="Meus Produtos" value={stats.myProducts || 0} icon={Package} color="bg-purple-600" />
            <StatCard title="Baixo Estoque" value="2" icon={AlertCircle} color="bg-red-600" />
          </>
        );
      case 'retailer':
        return (
          <>
            <StatCard title="Total Comprado" value={formatCurrency(stats.totalSpent || 0)} icon={DollarSign} color="bg-orange-600" />
            <StatCard title="Meus Pedidos" value={stats.myOrders || 0} icon={ShoppingCart} color="bg-blue-600" />
            <StatCard title="Entregas Pendentes" value="1" icon={Truck} color="bg-purple-600" />
            <StatCard title="Produtos Favoritos" value="12" icon={Package} color="bg-zinc-600" />
          </>
        );
      case 'driver':
        return (
          <>
            <StatCard title="Minhas Entregas" value={stats.myDeliveries || 0} icon={Truck} color="bg-orange-600" />
            <StatCard title="Concluídas" value={stats.completed || 0} icon={CheckCircle2} color="bg-emerald-600" />
            <StatCard title="Ganhos Estimados" value={formatCurrency(450.00)} icon={DollarSign} color="bg-blue-600" />
            <StatCard title="Avaliação" value="4.9" icon={TrendingUp} color="bg-purple-600" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Olá, {profile?.full_name?.split(' ')[0]}!</h1>
          <p className="text-zinc-500">Aqui está o resumo do seu negócio hoje.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-zinc-400 hover:text-white"
        >
          <Clock size={20} />
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-[#0A0A0A] border border-white/10 rounded-2xl animate-pulse" />
          ))
        ) : renderStats()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Desempenho Semanal</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <div className="w-3 h-3 rounded-full bg-orange-600" />
              Vendas
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#ea580c' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6">Pedidos Recentes</h2>
          <div className="space-y-6">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
              ))
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-10 text-zinc-500">Nenhum pedido recente</div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Clock size={18} className="text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate">{order.retailer?.name || 'Cliente'}</h4>
                    <p className="text-xs text-zinc-500">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(order.total_amount)}</p>
                    <span className={cn(
                      "text-[10px] uppercase tracking-wider font-bold",
                      order.status === 'pendente' ? "text-orange-500" : "text-green-500"
                    )}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={() => toast.info('Redirecionando para pedidos...')}
            className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all"
          >
            Ver todos os pedidos
          </button>
        </div>
      </div>
    </div>
  );
}
