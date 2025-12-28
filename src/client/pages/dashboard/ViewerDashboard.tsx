import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Search, Star, Video, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StoriesBar from '../../components/ui/StoriesBar';
import RechargeModal from '../../components/ui/RechargeModal';

interface StreamerProfile {
  id: number;
  username: string;
  photo_url: string | null;
  bio: string | null;
  price_per_minute: number;
  is_online: number;
  average_rating: number;
  total_ratings: number;
}

export default function ViewerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [streamers, setStreamers] = useState<StreamerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Recharge Modal State
  const [showRecharge, setShowRecharge] = useState(false);
  const [targetStreamer, setTargetStreamer] = useState<number | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data } = await api.get('/profiles');
      setStreamers(data);
    } catch (error) {
      console.error('Erro ao buscar streamers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCallClick = async (streamer: StreamerProfile) => {
    // Verificar saldo antes de ir para a tela de chamada
    try {
      const { data } = await api.get('/wallet/balance');
      const balance = data.balance;
      
      // Mínimo de 3 minutos ou R$ 10 para garantir
      const minRequired = Math.max(streamer.price_per_minute * 3, 10);

      if (balance < minRequired) {
        setTargetStreamer(streamer.id);
        setShowRecharge(true);
      } else {
        navigate(`/dashboard/call/${streamer.id}`);
      }
    } catch (error) {
      // Se der erro ao checar saldo, tenta ir para call e deixa o backend barrar
      navigate(`/dashboard/call/${streamer.id}`);
    }
  };

  const filteredStreamers = streamers.filter(s => 
    s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.bio && s.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <StoriesBar />
      
      <RechargeModal 
        isOpen={showRecharge} 
        onClose={() => setShowRecharge(false)}
        onSuccess={() => {
          if (targetStreamer) {
            navigate(`/dashboard/call/${targetStreamer}`);
          }
        }}
      />

      {/* Header & Search */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Explorar Modelos</h1>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou tag..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
        </div>
      ) : filteredStreamers.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>Nenhum streamer encontrado no momento.</p>
        </div>
      ) : (
        /* Featured Streamers Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredStreamers.map((streamer) => (
            <div key={streamer.id} className="group relative bg-dark-800 rounded-xl overflow-hidden border border-dark-700 hover:border-primary-500/50 transition-all hover:shadow-xl hover:shadow-primary-900/10">
              {/* Image */}
              <div className="aspect-[3/4] overflow-hidden bg-dark-700 relative">
                <img 
                  src={streamer.photo_url || `https://ui-avatars.com/api/?name=${streamer.username}&background=random&size=400`} 
                  alt={streamer.username} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${streamer.is_online ? 'bg-green-500 text-white' : 'bg-gray-500/80 text-white backdrop-blur-sm'}`}>
                    {streamer.is_online ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12">
                  <h3 className="text-lg font-bold text-white leading-tight">{streamer.username}</h3>
                  <div className="flex items-center mt-1 text-yellow-400 text-xs">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="ml-1 text-gray-300">
                      {streamer.average_rating > 0 ? streamer.average_rating.toFixed(1) : 'Novo'} ({streamer.total_ratings})
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 bg-dark-800 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Preço/min</p>
                  <p className="text-white font-bold">R$ {streamer.price_per_minute}</p>
                </div>
                
                <button 
                  onClick={() => handleCallClick(streamer)}
                  className="h-10 w-10 rounded-full bg-primary-600 hover:bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-900/50 transition-all transform hover:scale-110 active:scale-95"
                >
                  <Video className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
