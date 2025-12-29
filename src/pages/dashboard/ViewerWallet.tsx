import { useEffect, useState } from 'react';
import api from '@/services/api.ts';
import { Loader2, CreditCard, Wallet, ArrowUpRight, History } from 'lucide-react';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function ViewerWallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [balanceRes, historyRes] = await Promise.all([
        api.get('/wallet/balance'),
        api.get('/wallet/transactions')
      ]);
      setBalance(balanceRes.data.balance);
      setTransactions(historyRes.data);
    } catch (error) {
      console.error('Erro ao carregar carteira:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (amount: number) => {
    setProcessing(true);
    try {
      // Simulação de pagamento
      await api.post('/wallet/recharge', {
        amount,
        method: 'simulator'
      });
      
      // Atualizar dados
      await fetchWalletData();
      alert(`Recarga de R$ ${amount.toFixed(2)} realizada com sucesso!`);
    } catch (error) {
      alert('Erro ao processar recarga.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">Minha Carteira</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-primary-900 to-dark-800 p-8 rounded-2xl border border-primary-500/30 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-primary-200 font-medium mb-1">Saldo Disponível</p>
          <h2 className="text-4xl font-black text-white">R$ {balance.toFixed(2)}</h2>
        </div>
        <Wallet className="absolute right-8 bottom-8 h-32 w-32 text-primary-500/10 rotate-12" />
      </div>

      {/* Recharge Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Adicionar Saldo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[50, 100, 250, 500].map((amount) => (
            <button
              key={amount}
              onClick={() => handleRecharge(amount)}
              disabled={processing}
              className="bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-primary-500 p-6 rounded-xl transition-all group text-left"
            >
              <p className="text-gray-400 text-sm">Pacote</p>
              <p className="text-2xl font-bold text-white group-hover:text-primary-400">R$ {amount}</p>
              <div className="mt-4 flex items-center text-xs text-primary-500 font-bold uppercase tracking-wider">
                Comprar <ArrowUpRight className="ml-1 h-3 w-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-bold text-white">Histórico Recente</h3>
        </div>
        
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhuma transação encontrada.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-dark-900/50 text-gray-400">
                <tr>
                  <th className="p-4 font-medium">Tipo</th>
                  <th className="p-4 font-medium">Data</th>
                  <th className="p-4 font-medium">Valor</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-dark-700/50">
                    <td className="p-4">
                      {tx.type === 'deposit' ? 'Recarga' : 
                       tx.type === 'call_payment' ? 'Pagamento Chamada' : tx.type}
                    </td>
                    <td className="p-4 text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className={`p-4 font-bold ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'deposit' ? '+' : '-'} R$ {Number(tx.amount).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 uppercase">
                        {tx.status}
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
