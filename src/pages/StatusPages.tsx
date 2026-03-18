import { Clock, ShieldAlert, LogOut, Package, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function PendingApproval() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#0A0A0A] border border-white/10 rounded-3xl p-10"
      >
        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="text-yellow-500" size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-4">Aguardando Aprovação</h1>
        <p className="text-zinc-400 mb-8">
          Sua conta foi criada, mas ainda precisa ser revisada e aprovada por um administrador. 
          Você receberá um e-mail assim que seu acesso for liberado.
        </p>
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <LogOut size={20} />
          )}
          Sair da conta
        </button>
      </motion.div>
    </div>
  );
}

export function Blocked() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#0A0A0A] border border-white/10 rounded-3xl p-10"
      >
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="text-red-500" size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-4">Conta Bloqueada</h1>
        <p className="text-zinc-400 mb-8">
          Seu acesso a esta plataforma foi suspenso. Se você acredita que isso é um erro, 
          entre em contato com o suporte.
        </p>
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <LogOut size={20} />
          )}
          Sair da conta
        </button>
      </motion.div>
    </div>
  );
}

export function Unauthorized() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-[#0A0A0A] border border-white/10 rounded-3xl p-10">
        <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="text-orange-500" size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-4">Acesso Negado</h1>
        <p className="text-zinc-400 mb-8">
          Você não tem permissão para acessar esta página com seu perfil atual.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
