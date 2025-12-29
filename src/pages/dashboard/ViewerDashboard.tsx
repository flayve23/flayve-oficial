import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api.ts';
import { Search, Star, Video, Loader2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import StoriesBar from '../../components/ui/StoriesBar';

export default function ViewerDashboard() {
  const { user } = useAuth();
  const [streamers, setStreamers] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (viewMode === 'all') {
        const { data } = await api.get('/profiles');
        setStreamers(data);
      } else {
        const { data } = await api.get('/interactions/favorites');
        setStreamers(data);
      }
      
      // Carregar IDs dos favoritos para marcar os corações
      // (Em produção faríamos um endpoint melhor, aqui vamos simular ou carregar separadamente)
      // Vamos assumir que a lista de favoritos retorna os IDs
    } catch (error) {
      console.error('Erro', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, streamerId: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { data } = await api.post('/interactions/favorite', { streamer_id: streamerId });
      if (data.favorited) {
        setFavorites([...favorites, streamerId]);
      } else {
        setFavorites(favorites.filter(id => id !== streamerId));
        if (viewMode === 'favorites') {
            setStreamers(streamers.filter(s => s.user_id !== streamerId)); // Remove da lista visualmente
        }
      }
    } catch (e) { alert('Erro ao favoritar'); }
  };

  const filteredStreamers = streamers.filter(s => 
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <StoriesBar />
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Explorar</h1>
          
          <div className="flex bg-dark-800 p-1 rounded-lg border border-dark-700">
            <button 
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'all' ? 'bg-dark-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setViewMode('favorites')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'favorites' ? 'bg-primary-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Favoritos ❤️
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar modelo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary-500" /></div>
      ) : filteredStreamers.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Ninguém por aqui...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredStreamers.map((streamer) => (
            <div key={streamer.id} className="group relative bg-dark-800 rounded-2xl overflow-hidden border border-dark-700 shadow-lg hover:border-primary-500/30 transition-all">
              <Link to={`/dashboard/call/${streamer.user_id || streamer.id}`} className="block relative aspect-[3/4] bg-dark-700">
                <img 
                  src={streamer.photo_url || `https://ui-avatars.com/api/?name=${streamer.username}&background=random&size=400`} 
                  alt={streamer.username} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                <div className="absolute top-3 right-3 z-20">
                    <button 
                        onClick={(e) => toggleFavorite(e, streamer.user_id || streamer.id)}
                        className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-primary-500 transition-colors"
                    >
                        <Heart className="h-5 w-5" />
                    </button>
                </div>

                <div className="absolute top-3 left-3 z-10">
                  {streamer.is_online ? (
                    <div className="flex items-center gap-1.5 bg-green-500/90 backdrop-blur-md px-2.5 py-1 rounded-full">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      <span className="text-[10px] font-bold text-white uppercase tracking-wide">Live</span>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-gray-300 uppercase">Offline</span>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent pt-12">
                  <h3 className="text-lg font-bold text-white leading-tight">{streamer.username}</h3>
                  <div className="flex items-center gap-1 text-yellow-400 mt-1">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-xs font-bold text-gray-200">5.0</span>
                  </div>
                </div>
              </Link>
              
              <div className="p-3 bg-dark-800 border-t border-dark-700 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Valor</span>
                    <span className="text-sm font-bold text-white">R$ {streamer.price_per_minute}/min</span>
                </div>
                <Link 
                    to={`/dashboard/call/${streamer.user_id || streamer.id}`}
                    className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Video className="h-4 w-4" /> Ligar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
