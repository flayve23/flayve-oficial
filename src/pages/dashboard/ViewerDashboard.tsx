import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api.ts';
import { Search, Star, Video, Loader2, Heart, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StoriesBar from '../../components/ui/StoriesBar';

export default function ViewerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [streamers, setStreamers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Confirmation Modal State
  const [confirmCall, setConfirmCall] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/profiles');
      setStreamers(data);
    } catch (error) {
      console.error('Erro', error);
    } finally {
      setLoading(false);
    }
  };

  const initiateCall = (streamer: any) => {
      setConfirmCall(streamer);
  };

  const proceedToCall = () => {
      navigate(`/dashboard/call/${confirmCall.user_id}`);
  };

  const filteredStreamers = streamers.filter(s => 
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in relative">
      <StoriesBar />
      
      {/* Confirmation Modal */}
      {confirmCall && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-dark-800 border border-dark-600 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-2">Iniciar Chamada?</h3>
                  <div className="bg-dark-900 p-4 rounded-xl mb-4 border border-dark-700">
                      <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Modelo</span>
                          <span className="text-white font-bold">{confirmCall.username}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-gray-400">Preço</span>
                          <span className="text-primary-400 font-bold text-lg">R$ {confirmCall.price_per_minute}/min</span>
                      </div>
                  </div>
                  <div className="flex items-start gap-2 mb-6">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      <p className="text-xs text-gray-400">
                          Ao confirmar, você concorda com a cobrança por minuto. Certifique-se de ter saldo.
                      </p>
                  </div>
                  <div className="flex gap-3">
                      <button onClick={() => setConfirmCall(null)} className="flex-1 py-3 bg-dark-700 rounded-xl text-gray-300 font-bold hover:bg-dark-600">
                          Cancelar
                      </button>
                      <button onClick={proceedToCall} className="flex-1 py-3 bg-green-600 rounded-xl text-white font-bold hover:bg-green-500 shadow-lg shadow-green-900/20">
                          Confirmar e Ligar
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Explorar</h1>
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
              <div className="relative aspect-[3/4] bg-dark-700 cursor-pointer" onClick={() => initiateCall(streamer)}>
                <img 
                  src={streamer.photo_url || `https://ui-avatars.com/api/?name=${streamer.username}&background=random&size=400`} 
                  alt={streamer.username} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
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
              </div>
              
              <div className="p-3 bg-dark-800 border-t border-dark-700 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Valor</span>
                    <span className="text-sm font-bold text-white">R$ {streamer.price_per_minute}/min</span>
                </div>
                <button 
                    onClick={() => initiateCall(streamer)}
                    className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Video className="h-4 w-4" /> Ligar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
