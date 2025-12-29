import { useEffect, useState } from 'react';
import api from '../../services/api.ts';
import { Loader2, DollarSign, ArrowUpRight, History, Building } from 'lucide-react';

export default function EarningsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const { data } = await api.get('/streamer/earnings');
      setData(data);
    } catch (error) {
      console.error('Erro ao carregar ganhos', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await api.post('/streamer/withdraw', {
        amount: parseFloat(withdrawAmount),
        pix_key: 'email@streamer.com' // Simplificado
      });
      alert('Saque solicitado com sucesso!');
      setWithdrawAmount('');
      fetchEarnings();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao solicitar saque.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Ganhos e Saques</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Saldo */}
        <div className="bg-gradient-to-br from-dark-800 to-dark-900 p-8 rounded-2xl border border-dark-700">
          <p className="text-gray-400 font-medium mb-1">Saldo Disponível para Saque</p>
          <h2 className="text-4xl font-black text-white">R$ {Number(data?.available_balance || 0).toFixed(2)}</h2>
          <p className="text-sm text-gray-500 mt-2">
            Total acumulado (Lifetime): <span className="text-gray-300">R$ {Number(data?.total_lifetime_earnings || 0).toFixed(2)}</span>
          </p>
        </div>

        {/* Form Saque */}
        <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-primary-500" /> Solicitar Saque (PIX)
          </h3>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500">R$</span>
                <input
                  type="number"
                  min="50"
                  step="0.01"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Mínimo R$ 50,00. Taxa de antecipação: 5%.</p>
            </div>
            <button
              type="submit"
              disabled={processing || !withdrawAmount}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirmar Saque'}
            </button>
          </form>
        </div>
      </div>

      {/* Histórico */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <History className="h-5 w-5 text-gray-400" /> Histórico de Saques
        </h3>
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
          {data?.withdrawals?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum saque realizado ainda.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-dark-900/50 text-gray-400">
                <tr>
                  <th className="p-4 font-medium">Data</th>
                  <th className="p-4 font-medium">Valor</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {data?.withdrawals?.map((tx: any) => (
                  <tr key={tx.id}>
                    <td className="p-4 text-gray-400">{new Date(tx.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 font-bold text-white">R$ {Number(tx.amount).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                        tx.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                        tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {tx.status === 'pending' ? 'Pendente' : tx.status === 'completed' ? 'Pago' : 'Falha'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
