import { useState, useEffect } from 'react';
import { supabase, type Profile } from '../lib/supabase';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Shield, 
  UserCheck, 
  UserMinus,
  MoreVertical,
  Mail,
  Calendar,
  Clock,
  Filter,
  Building2,
  Trash2,
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'blocked'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, [filter]);

  async function fetchProfiles() {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*, companies(*)')
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar usuários: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const toggleFeatured = async (profileId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ is_featured: !currentStatus })
        .eq('profile_id', profileId);
      
      if (error) throw error;
      toast.success(`Fornecedor ${!currentStatus ? 'destacado' : 'removido dos destaques'} com sucesso!`);
      fetchProfiles();
    } catch (error: any) {
      toast.error('Erro ao atualizar destaque: ' + error.message);
    }
  };

  const updateStatus = async (userId: string, newStatus: string) => {
    setUpdatingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);
      
      if (error) throw error;
      toast.success(`Usuário ${newStatus === 'active' ? 'ativado' : newStatus === 'blocked' ? 'bloqueado' : 'atualizado'} com sucesso!`);
      fetchProfiles();
    } catch (error: any) {
      toast.error('Erro ao atualizar status: ' + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || profile.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Usuários</h1>
          <p className="text-zinc-500">Aprove, bloqueie e gerencie os perfis da plataforma.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-orange-500/50 transition-all"
            />
          </div>
          <div className="flex bg-[#0A0A0A] border border-white/10 rounded-xl p-1">
            {(['all', 'pending', 'active', 'blocked'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize",
                  filter === f ? "bg-orange-600 text-white" : "text-zinc-500 hover:text-white"
                )}
              >
                {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : f === 'active' ? 'Ativos' : 'Bloqueados'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {loading && profiles.length === 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-3xl">
            <Users size={48} className="mx-auto text-zinc-800 mb-4" />
            <h3 className="text-lg font-bold">Nenhum usuário encontrado</h3>
            <p className="text-zinc-500">Tente ajustar seus filtros ou busca.</p>
          </div>
        ) : (
          filteredProfiles.map((user) => (
            <div 
              key={user.id}
              className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center font-black text-xl text-zinc-400 border border-white/5">
                  {user.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-lg">{user.full_name}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      user.role === 'admin' ? "bg-purple-500/10 text-purple-500" :
                      user.role === 'supplier' ? "bg-blue-500/10 text-blue-500" :
                      user.role === 'retailer' ? "bg-orange-500/10 text-orange-500" :
                      "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {user.role}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-1 text-sm text-zinc-500">
                    <span className="flex items-center gap-1.5"><Mail size={14} className="text-zinc-600" /> {user.email}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-zinc-600" /> {format(new Date(user.created_at), "dd/MM/yyyy")}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                <div className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                  user.status === 'active' ? "bg-emerald-500/10 text-emerald-500" :
                  user.status === 'pending' ? "bg-yellow-500/10 text-yellow-500" :
                  "bg-red-500/10 text-red-500"
                )}>
                  {user.status === 'active' ? <CheckCircle2 size={12} /> : 
                   user.status === 'pending' ? <Clock size={12} /> : 
                   <XCircle size={12} />}
                  {user.status}
                </div>

                <div className="flex items-center gap-2">
                  {user.status === 'pending' && (
                    <>
                      <button 
                        disabled={updatingId === user.id}
                        onClick={() => updateStatus(user.id, 'active')}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {updatingId === user.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserCheck size={16} />}
                        Aprovar
                      </button>
                      <button 
                        disabled={updatingId === user.id}
                        onClick={() => updateStatus(user.id, 'blocked')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {updatingId === user.id ? <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> : <UserMinus size={16} />}
                        Bloquear
                      </button>
                    </>
                  )}

                  {user.status === 'active' && (
                    <button 
                      disabled={updatingId === user.id}
                      onClick={() => updateStatus(user.id, 'blocked')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {updatingId === user.id ? <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> : <UserMinus size={16} />}
                      Bloquear
                    </button>
                  )}

                  {user.role === 'supplier' && user.status === 'active' && (
                    <button 
                      onClick={() => toggleFeatured(user.id, (user as any).companies?.[0]?.is_featured || false)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                        (user as any).companies?.[0]?.is_featured 
                          ? "bg-yellow-500 text-black" 
                          : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                      )}
                    >
                      <Star size={16} fill={(user as any).companies?.[0]?.is_featured ? "currentColor" : "none"} />
                      {(user as any).companies?.[0]?.is_featured ? 'Destaque' : 'Destacar'}
                    </button>
                  )}

                  {user.status === 'blocked' && (
                    <button 
                      disabled={updatingId === user.id}
                      onClick={() => updateStatus(user.id, 'active')}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {updatingId === user.id ? <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /> : <UserCheck size={16} />}
                      Reativar
                    </button>
                  )}

                  <button 
                    onClick={() => toast.info('Edição de perfil em desenvolvimento')}
                    className="p-2 text-zinc-600 hover:text-white transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
