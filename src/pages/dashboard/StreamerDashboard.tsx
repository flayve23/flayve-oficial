import { useAuth } from '@/contexts/AuthContext.tsx';
import { DollarSign, Video, Users, TrendingUp } from 'lucide-react';

export default function StreamerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Olá, {user?.username} 👋</h1>
          <p className="text-gray-400">Aqui está o resumo do seu desempenho hoje.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-green-400 font-medium text-sm">Online e Disponível</span>
          <button className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white text-sm font-medium rounded-lg border border-dark-600 transition-all">
            Ficar Offline
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ganhos Hoje', value: 'R$ 124,50', icon: DollarSign, color: 'text-green-400' },
          { label: 'Tempo em Chamada', value: '1h 42m', icon: Video, color: 'text-blue-400' },
          { label: 'Visualizações', value: '1.2k', icon: Users, color: 'text-purple-400' },
          { label: 'Taxa de Conversão', value: '4.8%', icon: TrendingUp, color: 'text-orange-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-dark-800 p-6 rounded-xl border border-dark-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-lg bg-dark-700 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Calls */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <div className="p-6 border-b border-dark-700">
          <h3 className="text-lg font-bold text-white">Chamadas Recentes</h3>
        </div>
        <div className="p-6 text-center text-gray-500 py-12">
          <Video className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>Nenhuma chamada realizada hoje.</p>
        </div>
      </div>
    </div>
  );
}
