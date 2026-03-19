import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Store, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
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
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-500 text-sm font-bold mb-8"
          >
            <ShieldCheck size={16} />
            Segurança e Dados
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none"
          >
            Política de <span className="text-orange-600">Privacidade</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-zinc-400 leading-relaxed mb-12"
          >
            Última atualização: 19 de Março de 2026
          </motion.p>

          <div className="prose prose-invert prose-orange max-w-none space-y-12">
            <section>
              <h2 className="text-3xl font-black mb-6">1. Coleta de Informações</h2>
              <p className="text-zinc-400 leading-relaxed">
                Coletamos informações essenciais para o funcionamento da plataforma, incluindo dados de cadastro (nome, e-mail, telefone, CPF/CNPJ), informações de pagamento e dados de geolocalização para fins logísticos.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-6">2. Uso dos Dados</h2>
              <p className="text-zinc-400 leading-relaxed">
                Seus dados são utilizados para:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 mt-4">
                <li>Processar pedidos e pagamentos;</li>
                <li>Facilitar a comunicação entre fornecedores, compradores e entregadores;</li>
                <li>Melhorar a experiência do usuário e personalizar conteúdos;</li>
                <li>Garantir a segurança da plataforma e prevenir fraudes;</li>
                <li>Enviar notificações relevantes sobre o status de pedidos e atualizações do serviço.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-6">3. Compartilhamento de Informações</h2>
              <p className="text-zinc-400 leading-relaxed">
                Compartilhamos informações apenas quando necessário para a execução do serviço (ex: endereço de entrega para o entregador, dados de faturamento para o fornecedor). Não vendemos seus dados pessoais para terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-6">4. Segurança dos Dados</h2>
              <p className="text-zinc-400 leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou alteração. Utilizamos criptografia e protocolos de segurança modernos.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-6">5. Seus Direitos</h2>
              <p className="text-zinc-400 leading-relaxed">
                De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem o direito de acessar, corrigir, excluir ou portar seus dados pessoais. Você também pode revogar seu consentimento para o processamento de dados a qualquer momento através das configurações da sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-6">6. Cookies e Tecnologias de Rastreamento</h2>
              <p className="text-zinc-400 leading-relaxed">
                Utilizamos cookies para manter sua sessão ativa, lembrar suas preferências e analisar o tráfego da plataforma. Você pode gerenciar as configurações de cookies no seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-6">7. Contato sobre Privacidade</h2>
              <p className="text-zinc-400 leading-relaxed">
                Para qualquer dúvida ou solicitação relacionada à sua privacidade e proteção de dados, entre em contato através do e-mail: <strong>privacidade@conectab2b.com.br</strong>.
              </p>
            </section>
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
