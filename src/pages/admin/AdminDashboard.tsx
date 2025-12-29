import { useEffect, useState } from 'react';
import api from '@/lib/api.ts';
import { Loader2, Check, X, ShieldAlert, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [kycs, setKycs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKycs();
  }, []);
// ...
  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
        <Link 
          to="/admin/live-ops" 
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-red-900/20 animate-pulse"
        >
          <Video className="h-5 w-5" />
          MONITORAR AO VIVO
        </Link>
        <Link 
          to="/admin/commission" 
          className="ml-4 bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <DollarSign className="h-5 w-5 text-green-500" />
          TAXAS
        </Link>
      </div>

      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <div className="p-6 border-b border-dark-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-yellow-500" /> Verificações Pendentes (KYC)
          </h3>
          <span className="bg-dark-700 text-gray-300 px-3 py-1 rounded-full text-xs font-bold">
            {kycs.length} pendentes
          </span>
        </div>

        {kycs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhuma verificação pendente no momento.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-dark-900/50 text-gray-400">
                <tr>
                  <th className="p-4 font-medium">Usuário</th>
                  <th className="p-4 font-medium">Nome Completo</th>
                  <th className="p-4 font-medium">CPF</th>
                  <th className="p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {kycs.map((item) => (
                  <tr key={item.id} className="hover:bg-dark-700/50">
                    <td className="p-4">
                      <p className="text-white font-medium">{item.username}</p>
                      <p className="text-gray-500 text-xs">{item.email}</p>
                    </td>
                    <td className="p-4 text-gray-300">{item.full_name}</td>
                    <td className="p-4 text-gray-300 font-mono">{item.cpf}</td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => handleReview(item.id, 'approve')}
                        className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors"
                        title="Aprovar"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReview(item.id, 'reject')}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                        title="Rejeitar"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
