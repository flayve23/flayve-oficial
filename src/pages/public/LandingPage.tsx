import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, ShieldCheck, DollarSign, ArrowRight, Zap, ChevronDown, ChevronUp, Star, TrendingUp, LogIn } from 'lucide-react';

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
      <nav className="border-b border-white/5 bg-dark-900/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter">FLAYVE</span>
            </div>
            
            {/* Nav Desktop e Mobile Unificada para Login */}
            <div className="flex gap-3 items-center">
              <Link to="/login" className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Link>
              <Link 
                to="/signup" 
                className="text-sm font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-all"
              >
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* ... Resto do arquivo mantido ... */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
                Seu Tempo.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-500">
                  Seu Lucro.
                </span>
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/signup" className="px-8 py-4 bg-primary-600 text-white font-bold rounded-xl text-lg hover:scale-105 transition-all">Quero Transmitir</Link>
                <Link to="/signup" className="px-8 py-4 bg-dark-800 border border-dark-700 text-white font-bold rounded-xl text-lg">Quero Assistir</Link>
              </div>
            </div>
            <div className="lg:pl-12"><Simulator /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
