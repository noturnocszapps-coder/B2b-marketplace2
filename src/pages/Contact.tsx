import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Store, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Store className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter">ConectaB2B</span>
          </Link>
          <Link to="/" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft size={20} />
            Voltar
          </Link>
        </div>
      </nav>

      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Left Column - Contact Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-500 text-sm font-bold mb-8"
            >
              <MessageCircle size={16} />
              Fale Conosco
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none"
            >
              Estamos aqui para <span className="text-orange-600">te ouvir</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-zinc-400 leading-relaxed mb-12 max-w-md"
            >
              Dúvidas, sugestões ou parcerias? Escolha o canal que preferir e nossa equipe responderá o mais rápido possível.
            </motion.p>

            <div className="space-y-6">
              <a 
                href="mailto:contato@conectab2b.com.br" 
                className="flex items-center gap-6 p-6 rounded-3xl bg-zinc-900 border border-white/5 hover:border-orange-600/30 transition-all group"
              >
                <div className="w-14 h-14 bg-orange-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="text-orange-500" size={28} />
                </div>
                <div>
                  <div className="text-sm text-zinc-500 font-bold uppercase tracking-widest mb-1">E-mail</div>
                  <div className="text-xl font-bold">contato@conectab2b.com.br</div>
                </div>
              </a>

              <a 
                href="https://wa.me/5511999999999" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-6 p-6 rounded-3xl bg-zinc-900 border border-white/5 hover:border-green-600/30 transition-all group"
              >
                <div className="w-14 h-14 bg-green-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="text-green-500" size={28} />
                </div>
                <div>
                  <div className="text-sm text-zinc-500 font-bold uppercase tracking-widest mb-1">WhatsApp</div>
                  <div className="text-xl font-bold">(11) 99999-9999</div>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="p-10 rounded-[2.5rem] bg-zinc-900 border border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-400 ml-1">Nome</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Seu nome completo"
                    className="w-full px-6 py-4 bg-black border border-white/10 rounded-2xl focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-400 ml-1">E-mail</label>
                  <input 
                    required
                    type="email" 
                    placeholder="seu@email.com"
                    className="w-full px-6 py-4 bg-black border border-white/10 rounded-2xl focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 ml-1">Assunto</label>
                <select className="w-full px-6 py-4 bg-black border border-white/10 rounded-2xl focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition-all appearance-none">
                  <option>Dúvida Geral</option>
                  <option>Suporte Técnico</option>
                  <option>Parceria Comercial</option>
                  <option>Outros</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 ml-1">Mensagem</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Como podemos te ajudar?"
                  className="w-full px-6 py-4 bg-black border border-white/10 rounded-2xl focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition-all resize-none"
                ></textarea>
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full py-5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-600/20"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={20} />
                    Enviar Mensagem
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <Store className="text-white" size={16} />
            </div>
            <span className="text-lg font-black tracking-tighter">ConectaB2B</span>
          </div>
          
          <div className="flex gap-8 text-sm text-zinc-500">
            <Link to="/about" className="hover:text-white transition-colors">Quem Somos</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contato</Link>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="text-zinc-600 text-sm">
              © 2026 ConectaB2B. Todos os direitos reservados.
            </div>
            <a 
              href="https://www.ntaplicacoes.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-zinc-700 hover:text-orange-500 transition-colors uppercase tracking-widest font-bold"
            >
              Desenvolvido por NT Aplicações
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
