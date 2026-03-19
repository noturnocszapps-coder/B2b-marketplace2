import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Store, Users, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
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

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-500 text-sm font-bold mb-8"
          >
            <Users size={16} />
            Nossa História
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none"
          >
            Nascemos de uma <span className="text-orange-600">dor real</span> do mercado.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-zinc-400 leading-relaxed"
          >
            O ConectaB2B não é apenas mais uma plataforma de tecnologia. É a solução construída por quem viveu o dia a dia do atacado e distribuição.
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="prose prose-invert prose-orange max-w-none">
            <p className="text-lg text-zinc-300 leading-relaxed">
              Tudo começou com a experiência do nosso fundador, que durante anos esteve à frente da <strong>No Grau</strong>, uma empresa de destaque no setor. No comando da operação, ele sentiu na pele as dificuldades que pequenos e médios empreendedores enfrentam ao tentar comprar no atacado.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
              <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5">
                <div className="w-12 h-12 bg-orange-600/10 rounded-xl flex items-center justify-center mb-6">
                  <Store className="text-orange-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-4">A Dificuldade</h3>
                <p className="text-zinc-400">Processos manuais, falta de visibilidade de estoque e burocracia excessiva para compras simples.</p>
              </div>
              <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5">
                <div className="w-12 h-12 bg-orange-600/10 rounded-xl flex items-center justify-center mb-6">
                  <Truck className="text-orange-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-4">A Logística</h3>
                <p className="text-zinc-400">Entregas demoradas e falta de conexão direta entre quem vende e quem entrega.</p>
              </div>
            </div>

            <p className="text-lg text-zinc-300 leading-relaxed">
              Percebendo que essa dor não era apenas sua, mas de todo um ecossistema, nasceu a ideia do <strong>ConectaB2B</strong>. Uma plataforma desenhada para ser a ponte entre fornecedores que querem expandir e compradores que buscam agilidade e preços justos.
            </p>

            <h2 className="text-3xl font-black mt-16 mb-8">Nossa Missão</h2>
            <p className="text-lg text-zinc-300 leading-relaxed">
              Nossa missão é democratizar o acesso ao atacado, digitalizando processos que antes eram feitos em papel ou planilhas confusas. Queremos que cada fornecedor tenha sua própria loja digital profissional e que cada comprador encontre o que precisa em poucos cliques.
            </p>

            <div className="mt-16 p-10 rounded-[2.5rem] bg-gradient-to-br from-orange-600 to-orange-800 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4">Tecnologia com Alma</h3>
                <p className="text-orange-100 mb-8 max-w-md">
                  Acreditamos que a tecnologia deve servir às pessoas, não o contrário. Por isso, mantemos nosso atendimento humano e focado no sucesso de cada parceiro.
                </p>
                <Link to="/register" className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all">
                  Comece agora
                  <ArrowLeft className="rotate-180" size={20} />
                </Link>
              </div>
              <ShieldCheck className="absolute -bottom-10 -right-10 text-white/10 w-64 h-64 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            </div>
          </div>
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
