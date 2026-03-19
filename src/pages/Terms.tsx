import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Store, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
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
            <FileText size={16} />
            Documentação Legal
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none"
          >
            Termos de <span className="text-orange-600">Uso</span>.
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
              <h2 className="text-3xl font-black mb-6">1. Aceitação dos Termos</h2>
              <p className="text-zinc-400 leading-relaxed">
                Ao acessar e utilizar a plataforma ConectaB2B, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-6">2. Descrição do Serviço</h2>
              <p className="text-zinc-400 leading-relaxed">
                O ConectaB2B é uma plataforma de intermediação comercial B2B (Business to Business) que conecta fornecedores, compradores e entregadores. A plataforma fornece ferramentas para catálogo de produtos, gestão de pedidos, pagamentos e logística.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-6">3. Cadastro e Segurança</h2>
              <p className="text-zinc-400 leading-relaxed">
                Para utilizar certas funcionalidades, é necessário criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades que ocorram em sua conta. Informações falsas ou incompletas podem resultar na suspensão do acesso.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-6">4. Responsabilidades das Partes</h2>
              <div className="space-y-4">
                <p className="text-zinc-400 leading-relaxed">
                  <strong>Fornecedores:</strong> Responsáveis pela veracidade das informações dos produtos, estoque e cumprimento dos prazos de entrega acordados.
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  <strong>Compradores:</strong> Responsáveis pelo pagamento pontual e conferência dos produtos no ato da entrega.
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  <strong>Entregadores:</strong> Responsáveis pelo transporte seguro e ágil das mercadorias, mantendo a integridade dos produtos.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-6">5. Pagamentos e Taxas</h2>
              <p className="text-zinc-400 leading-relaxed">
                A plataforma pode cobrar taxas de serviço sobre as transações realizadas. Os métodos de pagamento aceitos e as condições de repasse são detalhados nas configurações de cada fornecedor. O ConectaB2B não se responsabiliza por disputas financeiras diretas entre as partes, mas oferece ferramentas de suporte para resolução de conflitos.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-6">6. Propriedade Intelectual</h2>
              <p className="text-zinc-400 leading-relaxed">
                Todo o conteúdo, marcas, logotipos e software da plataforma são de propriedade exclusiva do ConectaB2B ou de seus licenciadores, protegidos por leis de direitos autorais e propriedade intelectual.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-6">7. Modificações dos Termos</h2>
              <p className="text-zinc-400 leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão notificadas aos usuários. O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.
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
