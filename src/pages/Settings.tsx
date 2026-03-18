import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Building2, Shield, Bell, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulation for now as we don't have a full profile update form yet
    setTimeout(() => {
      toast.success('Configurações salvas com sucesso!');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-zinc-500">Gerencie sua conta e preferências da plataforma.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-orange-600 text-white rounded-xl font-bold transition-all">
            <User size={20} />
            Perfil
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:bg-white/5 rounded-xl font-bold transition-all">
            <Shield size={20} />
            Segurança
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:bg-white/5 rounded-xl font-bold transition-all">
            <Bell size={20} />
            Notificações
          </button>
        </aside>

        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-white/5">
              <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-bold">
                {profile?.full_name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{profile?.full_name}</h3>
                <p className="text-zinc-500 capitalize">{profile?.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nome Completo</label>
                <input 
                  type="text" 
                  defaultValue={profile?.full_name}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">E-mail</label>
                <input 
                  type="email" 
                  defaultValue={profile?.email}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 opacity-50 cursor-not-allowed"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
              Salvar Alterações
            </button>
          </form>

          <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8">
            <h3 className="text-red-500 font-bold mb-2">Zona de Perigo</h3>
            <p className="text-zinc-500 text-sm mb-6">Uma vez que você excluir sua conta, não há como voltar atrás. Por favor, tenha certeza.</p>
            <button className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-all">
              Excluir minha conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
