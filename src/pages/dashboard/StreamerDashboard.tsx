import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { DollarSign, Video, Users, TrendingUp, Power, Tag } from 'lucide-react';

export default function StreamerDashboard() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStatus();
    fetchStats();
  }, []);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get('/profiles/me');
      setIsOnline(!!data.is_online);
    } catch (e) {}
  };

  const fetchStats = async () => {
    // Mock stats for MVP, in real app fetch from /streamer/stats
    setStats({ earnings: 124.50, hours: '1h 42m', views: '1.2k', conversion: '4.8%' });
  }

  const toggleOnline = async () => {
    const newState = !isOnline;
    setIsOnline(newState); // Optimistic update
    try {
      await api.post('/interactions/toggle-status', { is_online: newState });
    } catch (error) {
      setIsOnline(!newState); // Rollback
      alert('Erro ao mudar status');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header com Botão Gigante */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-dark-800 p-6 rounded-2xl border border-dark-700">
        <div>
          <h1 className="text-2xl font-bold text-white">Olá, {user?.username} 👋</h1>
          <p className="text-gray-400">Pronta para faturar hoje?</p>
        </div>
        
        <button
          onClick={toggleOnline}
          className={`relative group px-8 py-4 rounded-xl font-black text-xl transition-all transform hover:scale-105 shadow-xl flex items-center gap-3 ${
            isOnline 
              ? 'bg-green-500 text-white shadow-green-900/50' 
              : 'bg-dark-600 text-gray-400 shadow-none border-2 border-dashed border-dark-500'
          }`}
        >
          <Power className={`h-6 w-6 ${isOnline ? 'animate-pulse' : ''}`} />
          {isOnline ? 'VOCÊ ESTÁ ONLINE' : 'FICAR ONLINE'}
          {isOnline && (
            <span className="absolute -top-2 -right-2 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-dark-800"></span>
            </span>
          )}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ganhos Hoje', value: `R$ ${stats?.earnings || '0,00'}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Tempo Online', value: stats?.hours || '0h', icon: Video, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Visitas', value: stats?.views || '0', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Conversão', value: stats?.conversion || '0%', icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-dark-800 p-6 rounded-xl border border-dark-700 hover:border-primary-500/20 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-white">{stat.value}</h3>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions (Categorias, etc) */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary-500" /> Suas Categorias
        </h3>
        <div className="flex flex-wrap gap-2">
          {['Conversa', 'Dança', 'Fantasia', 'ASMR'].map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full bg-dark-700 text-gray-300 text-sm border border-dark-600 cursor-pointer hover:bg-primary-500/20 hover:text-primary-400 transition-colors">
              #{tag}
            </span>
          ))}
          <button className="px-3 py-1 rounded-full border border-dashed border-gray-500 text-gray-500 text-sm hover:text-white hover:border-white transition-colors">
            + Adicionar
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">* Funcionalidade visual no MVP.</p>
      </div>
    </div>
  );
}
