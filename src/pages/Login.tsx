import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Package, ArrowRight, Lock, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-600/20">
            <Package className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Bem-vindo de volta</h1>
          <p className="text-zinc-500">Entre com suas credenciais para acessar o painel.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Mail size={16} /> E-mail
              </label>
              <input
                required
                type="email"
                placeholder="exemplo@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Lock size={16} /> Senha
              </label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar no Painel'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        </motion.div>

        <p className="text-center mt-8 text-zinc-500">
          Não tem uma conta? <Link to="/register" className="text-orange-500 font-semibold hover:underline">Cadastre-se agora</Link>
        </p>
      </div>
    </div>
  );
}
