import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShoppingBag, 
  Package, 
  Truck, 
  Smartphone, 
  ShieldCheck, 
  CreditCard,
  Store,
  Users,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PLATFORM_NAME = "ConectaB2B";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 selection:text-orange-500">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                <Package className="text-white" size={24} />
              </div>
              <span className="text-xl font-black tracking-tighter">{PLATFORM_NAME}</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#como-funciona" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Como Funciona</a>
              <a href="#para-quem" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Para Quem</a>
              <Link to="/about" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Quem Somos</Link>
              <div className="h-4 w-px bg-white/10" />
              <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Entrar</Link>
              <Link 
                to="/register" 
                className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-zinc-200 transition-all"
              >
                Começar Agora
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-zinc-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-[#0A0A0A] border-b border-white/5 px-4 py-6 space-y-4"
          >
            <a href="#como-funciona" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-zinc-400">Como Funciona</a>
            <a href="#para-quem" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-zinc-400">Para Quem</a>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-zinc-400">Quem Somos</Link>
            <div className="pt-4 flex flex-col gap-4">
              <Link to="/login" className="text-center py-3 text-zinc-400 font-medium">Entrar</Link>
              <Link to="/register" className="text-center py-3 bg-orange-600 text-white rounded-xl font-bold">Começar Agora</Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-500 text-xs font-bold uppercase tracking-widest mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              O futuro do atacado chegou
            </motion.div>

            <motion.h1 
              {...fadeIn}
              className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]"
            >
              Compre no atacado direto de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300">fornecedores da sua região</span>
            </motion.h1>

            <motion.p 
              {...fadeIn}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Conectamos pequenas empresas aos melhores distribuidores com entrega rápida e pagamento facilitado via Pix.
            </motion.p>

            <motion.div 
              {...fadeIn}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link 
                to="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 group shadow-xl shadow-orange-600/20"
              >
                🚀 Começar agora
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link 
                to="/register?role=supplier" 
                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                <Store size={20} />
                Sou fornecedor
              </Link>
              <Link 
                to="/register?role=driver" 
                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                <Truck size={20} />
                Sou entregador
              </Link>
            </motion.div>

            {/* Visual Elements */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-20 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
              <div className="grid grid-cols-3 gap-4 opacity-40">
                <div className="aspect-video bg-zinc-900 rounded-3xl border border-white/5" />
                <div className="aspect-video bg-zinc-800 rounded-3xl border border-white/5 transform translate-y-8" />
                <div className="aspect-video bg-zinc-900 rounded-3xl border border-white/5" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-24 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Como funciona</h2>
            <p className="text-zinc-500">Três passos simples para transformar seu negócio</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Escolha os produtos",
                desc: "Navegue pelo catálogo completo de diversos fornecedores locais.",
                icon: <ShoppingBag className="text-orange-500" size={32} />
              },
              {
                step: "02",
                title: "Faça o pedido pelo app",
                desc: "Adicione ao carrinho e finalize seu pedido em segundos via Pix.",
                icon: <Smartphone className="text-orange-500" size={32} />
              },
              {
                step: "03",
                title: "Receba na sua loja",
                desc: "Acompanhe a entrega em tempo real até a porta do seu estabelecimento.",
                icon: <Truck className="text-orange-500" size={32} />
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="relative p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all"
              >
                <div className="text-5xl font-black text-white/5 absolute top-4 right-8">{item.step}</div>
                <div className="w-16 h-16 bg-orange-600/10 rounded-2xl flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Para Quem */}
      <section id="para-quem" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-10 rounded-[2.5rem] bg-gradient-to-br from-orange-600 to-orange-800 group overflow-hidden relative"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                  <Store className="text-white" size={32} />
                </div>
                <h3 className="text-4xl font-black mb-4">Lojistas</h3>
                <p className="text-white/80 text-lg mb-8 max-w-md">
                  Compre mais barato, receba rápido e nunca mais fique sem estoque. Ideal para adegas, bares e mercados.
                </p>
                <Link to="/register?role=retailer" className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-zinc-100 transition-all">
                  Criar conta de lojista
                  <ChevronRight size={20} />
                </Link>
              </div>
              <ShoppingBag className="absolute -bottom-10 -right-10 text-white/10 w-64 h-64 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-10 rounded-[2.5rem] bg-zinc-900 border border-white/10 group overflow-hidden relative"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-orange-600/10 rounded-2xl flex items-center justify-center mb-8">
                  <Users className="text-orange-500" size={32} />
                </div>
                <h3 className="text-4xl font-black mb-4">Fornecedores</h3>
                <p className="text-zinc-400 text-lg mb-8 max-w-md">
                  Venda mais, alcance novos clientes e digitalize sua operação de distribuição com ferramentas modernas.
                </p>
                <Link to="/register?role=supplier" className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all">
                  Seja um fornecedor
                  <ChevronRight size={20} />
                </Link>
              </div>
              <Package className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-10 rounded-[2.5rem] bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 group overflow-hidden relative lg:col-span-2"
            >
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="max-w-xl">
                  <div className="w-16 h-16 bg-orange-600/10 rounded-2xl flex items-center justify-center mb-8">
                    <Truck className="text-orange-500" size={32} />
                  </div>
                  <h3 className="text-4xl font-black mb-4">Entregadores</h3>
                  <p className="text-zinc-400 text-lg mb-8">
                    Faça parte da nossa rede logística. Ganhe dinheiro realizando entregas para os melhores fornecedores da sua região.
                  </p>
                  <Link to="/register?role=driver" className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all shadow-xl shadow-white/5">
                    Quero ser entregador
                    <ArrowRight size={20} />
                  </Link>
                </div>
                <div className="hidden md:block">
                  <div className="w-64 h-64 bg-orange-600/20 rounded-full blur-3xl absolute -right-20 -top-20" />
                  <div className="relative">
                    <div className="w-48 h-48 bg-zinc-800 rounded-3xl border border-white/10 rotate-12 flex items-center justify-center">
                      <Smartphone className="text-orange-500" size={64} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section id="diferenciais" className="py-24 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Truck />, title: "Entrega rápida", desc: "Receba seus produtos no mesmo dia ou em até 24h." },
              { icon: <CreditCard />, title: "Pagamento via Pix", desc: "Transações seguras e confirmação instantânea." },
              { icon: <Smartphone />, title: "Tudo pelo celular", desc: "Gerencie pedidos e estoque de onde estiver." },
              { icon: <ShieldCheck />, title: "Verificados", desc: "Apenas fornecedores de confiança na plataforma." }
            ].map((item, idx) => (
              <div key={idx} className="space-y-4">
                <div className="text-orange-500">{item.icon}</div>
                <h4 className="text-xl font-bold">{item.title}</h4>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prova / Valor */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8">Feito para quem vive o dia a dia do comércio</h2>
            <p className="text-xl text-zinc-400 mb-12">
              Resolvemos a falta de fornecedores, os preços abusivos e a demora na entrega. 
              Sua loja merece uma operação profissional.
            </p>
            <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale">
              {/* Mock Logos */}
              <div className="font-bold text-2xl tracking-tighter">ADEGA VIP</div>
              <div className="font-bold text-2xl tracking-tighter">BAR DO ZÉ</div>
              <div className="font-bold text-2xl tracking-tighter">CONVENIÊNCIA 24H</div>
              <div className="font-bold text-2xl tracking-tighter">TABACARIA ELITE</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-orange-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-8">Comece agora e aumente seus pedidos</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="w-full sm:w-auto px-10 py-4 bg-white text-orange-600 rounded-2xl font-bold text-xl hover:bg-zinc-100 transition-all">
                  Criar conta grátis
                </Link>
                <Link to="/login" className="w-full sm:w-auto px-10 py-4 bg-orange-700 text-white rounded-2xl font-bold text-xl hover:bg-orange-800 transition-all">
                  Acessar plataforma
                </Link>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <Package className="text-white" size={18} />
              </div>
              <span className="font-bold tracking-tighter">{PLATFORM_NAME}</span>
            </div>
            
            <div className="flex gap-8 text-sm text-zinc-500">
              <Link to="/about" className="hover:text-white transition-colors">Quem Somos</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Termos de Uso</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contato</Link>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="text-zinc-600 text-sm">
                © 2026 {PLATFORM_NAME}. Todos os direitos reservados.
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
        </div>
      </footer>
    </div>
  );
}
