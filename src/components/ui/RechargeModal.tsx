import { useState } from 'react';
import { X, DollarSign, Loader2, CreditCard } from 'lucide-react';
import api from '../../services/api.ts';

export default function RechargeModal({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');
  const packages = [20, 50, 100, 200];

  if (!isOpen) return null;

  const handleRecharge = async (value: number) => {
    setLoading(true);
    try {
      // Aqui integrariamos com a API do Mercado Pago
      // V86: Simulação melhorada
      await api.post('/wallet/recharge', { 
        amount: value,
        method: 'pix' 
      });
      onSuccess();
      onClose();
      alert('Recarga realizada com sucesso! (Simulado)');
    } catch (error) {
      alert('Erro ao recarregar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-800 w-full max-w-md rounded-2xl border border-dark-600 shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="p-4 border-b border-dark-700 flex justify-between items-center bg-dark-900">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="text-primary-500" /> Adicionar Saldo
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {packages.map((pkg) => (
              <button
                key={pkg}
                onClick={() => handleRecharge(pkg)}
                disabled={loading}
                className="p-4 bg-dark-700 hover:bg-primary-600 hover:text-white rounded-xl border border-dark-600 transition-all text-center group"
              >
                <div className="text-sm text-gray-400 group-hover:text-primary-200">Pacote</div>
                <div className="text-2xl font-bold text-white">R$ {pkg}</div>
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-800 text-gray-500">Ou digite um valor</span>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
                <span className="absolute left-4 top-3.5 text-gray-500">R$</span>
                <input 
                    type="number" 
                    placeholder="Outro valor..."
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-600 rounded-xl text-white focus:border-primary-500 outline-none"
                />
            </div>
            <button 
                onClick={() => amount && handleRecharge(Number(amount))}
                disabled={!amount || loading}
                className="bg-primary-600 hover:bg-primary-500 text-white px-6 rounded-xl font-bold disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Pagar'}
            </button>
          </div>
          
          <div className="bg-green-500/10 p-3 rounded-lg flex items-start gap-3">
             <ShieldCheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
             <p className="text-xs text-green-400">
                Pagamento processado via PIX/Cartão. Seus dados são criptografados e nunca são compartilhados com as modelos.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShieldCheckIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
    )
}
