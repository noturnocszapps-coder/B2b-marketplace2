import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  Store
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarItem {
  title: string;
  path: string;
  icon: any;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'supplier', 'retailer', 'driver'] },
  { title: 'Produtos', path: '/products', icon: Package, roles: ['admin', 'supplier'] },
  { title: 'Catálogo', path: '/catalog', icon: Store, roles: ['admin', 'retailer'] },
  { title: 'Pedidos', path: '/orders', icon: ShoppingCart, roles: ['admin', 'supplier', 'retailer'] },
  { title: 'Entregas', path: '/deliveries', icon: Truck, roles: ['admin', 'driver'] },
  { title: 'Usuários', path: '/admin/users', icon: Users, roles: ['admin'] },
  { title: 'Configurações', path: '/settings', icon: Settings, roles: ['admin', 'supplier', 'retailer', 'driver'] },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredItems = sidebarItems.filter(item => 
    profile && item.roles.includes(profile.role)
  );

  // Fallback items if for some reason filteredItems is empty but user is logged in
  const displayItems = filteredItems.length > 0 ? filteredItems : (
    profile ? sidebarItems.filter(item => item.path === '/dashboard' || item.path === '/settings') : []
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-[#0A0A0A] p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
            <Package className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">B2B MARKET</span>
        </div>

        <nav className="flex-1 space-y-1">
          {displayItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-orange-600/10 text-orange-500 border border-orange-600/20" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={20} className={isActive ? "text-orange-500" : "group-hover:text-white"} />
                <span className="font-medium">{item.title}</span>
                {isActive && <motion.div layoutId="active-pill" className="ml-auto"><ChevronRight size={16} /></motion.div>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{profile?.full_name}</span>
              <span className="text-xs text-zinc-500 capitalize">{profile?.role}</span>
            </div>
          </div>
          <button 
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-zinc-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0A0A] border-b border-white/10 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2">
          <Package className="text-orange-500" size={24} />
          <span className="font-bold tracking-tight">B2B MARKET</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="md:hidden fixed inset-0 bg-[#0A0A0A] z-40 pt-20 px-6"
          >
            <nav className="space-y-2">
              {displayItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-4 rounded-xl text-lg",
                    location.pathname === item.path ? "bg-orange-600 text-white" : "text-zinc-400"
                  )}
                >
                  <item.icon size={24} />
                  <span>{item.title}</span>
                </Link>
              ))}
              <button 
                onClick={signOut}
                className="flex items-center gap-4 px-4 py-4 w-full text-zinc-400 text-lg"
              >
                <LogOut size={24} />
                <span>Sair</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 pt-24 md:pt-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
