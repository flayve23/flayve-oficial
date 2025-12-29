import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, ShieldCheck, DollarSign, ArrowRight, Zap, ChevronDown, ChevronUp, Star, TrendingUp } from 'lucide-react';

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-dark-700">
      <button 
        className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-white group-hover:text-primary-400 transition-colors">{question}</span>
        {isOpen ? <ChevronUp className="text-primary-500" /> : <ChevronDown className="text-gray-500" />}
      </button>
      {isOpen && (
        <div className="pb-6 text-gray-400 leading-relaxed animate-in slide-in-from-top-2">
          {answer}
        </div>
      )}
    </div>
  );
}

function Simulator() {
  const [hours, setHours] = useState(2);
  const [price, setPrice] = useState(5);
  
  // Cálculo: Horas * 60 min * Preço * 0.70 (Comissão) * 30 dias (Estimativa otimista)
  // Vamos ser realistas: 20 dias úteis
  const monthly = hours * 60 * price * 0.70 * 20;

  return (
    <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 bg-green-500/10 rounded-bl-2xl border-b border-l border-green-500/20 text-green-400 font-bold text-xs uppercase tracking-wider">
        Simulador de Renda
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-6">Quanto você pode ganhar?</h3>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-gray-400 text-sm">Horas online por dia</label>
            <span className="text-white font-bold">{hours}h</span>
          </div>
          <input 
            type="range" min="1" max="12" value={hours} 
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-gray-400 text-sm">Preço por minuto (R$)</label>
            <span className="text-white font-bold">R$ {price},00</span>
          </div>
          <input 
            type="range" min="2" max="20" value={price} 
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-dark-700 text-center">
        <p className="text-gray-400 text-sm mb-1">Potencial Mensal (Líquido)</p>
        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
          R$ {monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="text-xs text-gray-500 mt-2">*Estimativa baseada em ocupação média de 20 dias.</p>
        
        <Link to="/signup" className="mt-6 w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl flex items-center justify-center transition-all transform hover:scale-105 shadow-lg shadow-primary-900/50">
          Começar a Faturar <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans selection:bg-primary-500 selection:text-white overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-dark-900/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter">FLAYVE</span>
            </div>
            <div className="flex gap-4 items-center">
              <Link to="/login" className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Entrar
              </Link>
              <Link 
                to="/signup" 
                className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-full hover:bg-gray-200 transition-all transform hover:scale-105"
              >
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-800 border border-dark-700 text-primary-400 text-xs font-bold uppercase tracking-wider mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Zap className="h-3 w-3" /> A Plataforma #1 de Conexões Reais
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
                Seu Tempo.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-500">
                  Seu Lucro.
                </span>
              </h1>
              
              <p className="text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Conecte-se com fãs em chamadas de vídeo privadas, receba presentes e monetize sua influência com segurança total e pagamentos rápidos via PIX.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/signup" 
                  className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary-900/50 flex items-center justify-center gap-2"
                >
                  Quero Transmitir <ArrowRight className="h-5 w-5" />
                </Link>
                <Link 
                  to="/signup" 
                  className="px-8 py-4 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-white font-bold rounded-xl text-lg transition-all flex items-center justify-center"
                >
                  Quero Assistir
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-green-500" /> Dados Seguros</div>
                <div className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-green-500" /> Saque PIX</div>
              </div>
            </div>

            <div className="lg:pl-12">
              <Simulator />
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof / Stats */}
      <div className="border-y border-white/5 bg-dark-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-black text-white mb-1">R$ 1.2M+</div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Pagos a Criadores</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white mb-1">50k+</div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Usuários Ativos</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white mb-1">24/7</div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Suporte Real</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white mb-1">4.9/5</div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Avaliação Média</div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Por que escolher o FLAYVE?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Desenvolvido por quem entende do mercado para quem quer faturar alto.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-dark-800 border border-dark-700 hover:border-primary-500/30 transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary-900/20">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Taxas Competitivas</h3>
            <p className="text-gray-400">Fique com até 80% dos seus ganhos. Nosso modelo valoriza quem produz. Quanto mais você cresce, menos taxas você paga.</p>
          </div>
          
          <div className="p-8 rounded-2xl bg-dark-800 border border-dark-700 hover:border-green-500/30 transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-green-900/20">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Receba na Hora</h3>
            <p className="text-gray-400">Nada de esperar 30 dias. Solicite seu saque via PIX e receba seus ganhos com agilidade e transparência.</p>
          </div>

          <div className="p-8 rounded-2xl bg-dark-800 border border-dark-700 hover:border-blue-500/30 transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Blindagem Total</h3>
            <p className="text-gray-400">Proteção contra vazamento de dados, prints e gravações. Sistema anti-fraude e moderação ativa 24 horas.</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-24 bg-dark-800/30 border-y border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Dúvidas Frequentes</h2>
            <p className="text-gray-400">Tudo limpo e transparente.</p>
          </div>

          <div className="space-y-2">
            <FaqItem 
              question="É seguro? Meus dados são anônimos?" 
              answer="Sim. A segurança é nossa prioridade. Para Viewers, o uso pode ser anônimo e o nome na fatura do cartão é discreto (FLV TECH). Para Criadores, seus dados reais são usados apenas para verificação interna e nunca são expostos." 
            />
            <FaqItem 
              question="Quanto eu ganho como Criador?" 
              answer="Você define seu preço por minuto (ex: R$ 5,00/min). A plataforma fica com uma taxa administrativa de 30% inicial, podendo cair para 20% conforme seu desempenho. Você recebe o líquido via PIX." 
            />
            <FaqItem 
              question="Como funcionam os pagamentos?" 
              answer="Viewers recarregam a carteira via PIX ou Cartão. O saldo é descontado em tempo real durante a chamada. Criadores podem solicitar o saque assim que atingirem o valor mínimo de R$ 50,00." 
            />
            <FaqItem 
              question="Preciso de equipamentos profissionais?" 
              answer="Não! 90% dos nossos criadores de sucesso usam apenas um smartphone com boa câmera e iluminação natural. O importante é a conexão e a criatividade." 
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center text-white font-bold text-xs">F</div>
            <span className="text-lg font-black text-white">FLAYVE</span>
          </div>
          <div className="flex justify-center gap-8 mb-8 text-sm text-gray-400">
            <Link to="/terms" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Privacidade</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contato</Link>
            <a href="#" className="hover:text-white transition-colors">Suporte</a>
          </div>
          <p className="text-xs text-gray-600">
            &copy; 2025 Flayve Inc. Todos os direitos reservados. +18.
          </p>
        </div>
      </footer>
    </div>
  );
}
