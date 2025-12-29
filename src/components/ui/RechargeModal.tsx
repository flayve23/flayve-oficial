import { useState } from 'react';
import api from '@/services/api';
import { Loader2, X, Zap, CreditCard } from 'lucide-react';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
  missingAmount?: number;
}

export default function RechargeModal({ isOpen, onClose, onSuccess, missingAmount }: RechargeModalProps) {
  const [loading, setLoading] = useState(false);
  const [cpf, setCpf] = useState('');

  if (!isOpen) return null;

  const handleRecharge = async (amount: number) => {
    if (!cpf || cpf.length < 11) {
      alert('Por favor, informe um CPF válido para segurança.');
      return;
    }

    setLoading(true);
    try {
      // Simula recarga instantânea
      const { data } = await api.post('/wallet/recharge', {
        amount,
        method: 'pix_instant',
        cpf: cpf.replace(/\D/g, '')
      });
      
      // Busca saldo atualizado
      const balanceRes = await api.get('/wallet/balance');
      
      onSuccess(balanceRes.data.balance);
      alert(`Recarga de R$ ${amount} realizada!`);
      onClose();
    } catch (error) {
      alert('Erro na recarga.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-800 w-full max-w-md rounded-2xl border border-dark-700 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-900 to-dark-800 p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-400 font-bold text-xs uppercase tracking-wider">Recarga Rápida</span>
          </div>
          <h3 className="text-xl font-bold text-white">Saldo Insuficiente</h3>
          <p className="text-primary-200 text-sm mt-1">
            Adicione créditos agora para continuar sem perder o momento.
          </p>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[20, 50, 100].map((amount) => (
              <button
                key={amount}
                onClick={() => handleRecharge(amount)}
                disabled={loading}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-dark-600 bg-dark-900 hover:border-primary-500 hover:bg-dark-700 transition-all group"
              >
                <span className="text-gray-400 text-xs mb-1">Pacote</span>
                <span className="text-xl font-bold text-white group-hover:text-primary-400">R$ {amount}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">CPF do Titular (Segurança)</label>
            <input 
              type="text" 
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <p className="text-[10px] text-gray-500 mt-1">O CPF deve ser o mesmo da conta bancária/cartão.</p>
          </div>

          <button
            onClick={() => handleRecharge(missingAmount && missingAmount > 20 ? Math.ceil(missingAmount) : 50)}
            disabled={loading}
            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
              <>
                <CreditCard className="h-5 w-5" />
                Pagar com PIX (Instantâneo)
              </>
            )}
          </button>
          
          <p className="text-center text-xs text-gray-500">
            Ambiente seguro. Seus créditos não expiram.
          </p>
        </div>
      </div>
    </div>
  );
}
