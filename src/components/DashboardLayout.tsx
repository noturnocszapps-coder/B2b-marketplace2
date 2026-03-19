import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { 
  LogOut,
  Menu,
  X,
  ChevronRight,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NAVIGATION_ITEMS, UserRole } from '../config/navigation';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile, signOut, loading } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [isMobileMenuOpen]);

  const filteredItems = NAVIGATION_ITEMS.filter(item => 
    profile && item.roles.includes(profile.role as UserRole)
  );

  if (import.meta.env.DEV) {
    console.log('[DashboardLayout] Profile:', profile);
    console.log('[DashboardLayout] Role:', profile?.role);
    console.log('[DashboardLayout] Filtered Items:', filteredItems.map(i => i.title));
  }

  // Fallback items if for some reason filteredItems is empty but user is logged in
  const displayItems = filteredItems.length > 0 ? filteredItems : (
    profile ? NAVIGATION_ITEMS.filter(item => item.path === '/dashboard' || item.path === '/settings') : []
  );

  const MenuSkeleton = () => (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-white/5 rounded-xl w-full" />
      ))}
    </div>
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
          {loading ? (
            <MenuSkeleton />
          ) : (
            displayItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
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
                </motion.div>
              );
            })
          )}
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
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0A0A] border-b border-white/10 flex items-center justify-between px-6 z-[120]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <Package className="text-white" size={18} />
          </div>
          <span className="font-bold tracking-tight">B2B MARKET</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            
            {/* Drawer Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-[#0A0A0A] z-[110] shadow-2xl border-r border-white/10 flex flex-col"
            >
              <div className="p-6 pt-20 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold border border-white/10">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold truncate">{profile?.full_name}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{profile?.role}</span>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
                {loading ? (
                  <MenuSkeleton />
                ) : (
                  displayItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all",
                          isActive 
                            ? "bg-orange-600/10 text-orange-500 font-bold" 
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <item.icon size={20} className={isActive ? "text-orange-500" : ""} />
                        <span className="text-sm">{item.title}</span>
                        {isActive && <ChevronRight size={14} className="ml-auto" />}
                      </Link>
                    );
                  })
                )}
              </nav>

              <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-4 px-4 py-4 w-full text-zinc-400 hover:text-red-400 transition-colors rounded-xl"
                >
                  <LogOut size={20} />
                  <span className="font-bold text-sm">Sair da Conta</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 pt-24 md:pt-10 overflow-y-auto">
        <motion.div 
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
