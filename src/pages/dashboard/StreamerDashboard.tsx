import { useEffect, useState } from 'react';
import api from '../../services/api.ts';
import { Loader2, DollarSign, Users, Clock, Video, Plus, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StreamerDashboard() {
  const [stats, setStats] = useState({ earnings: 0, views: 0, calls_duration: 0 });
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Stories State
  const [stories, setStories] = useState<any[]>([]);
  const [uploadingStory, setUploadingStory] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/streamer/stats'); // Assume exists or mocked
      setStats(data || { earnings: 0, views: 0, calls_duration: 0 });
      const profileRes = await api.get('/profiles/me');
      setIsOnline(!!profileRes.data?.is_online);
      
      // Fetch My Stories
      const storiesRes = await api.get('/stories/me'); // New endpoint needed
      setStories(storiesRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    try {
      const { data } = await api.post('/interactions/toggle-status');
      setIsOnline(data.is_online);
    } catch (e) { alert('Erro ao alterar status'); }
  };

  const handlePostStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingStory(true);
    const file = e.target.files[0];
    
    try {
        // 1. Upload to R2
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await api.post('/storage/upload/stories', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // 2. Create Story Record
        await api.post('/stories', {
            media_url: uploadRes.data.url,
            type: file.type.startsWith('video') ? 'video' : 'image'
        });

        alert('Story postado!');
        fetchData(); // Reload
    } catch (e) {
        alert('Erro ao postar story.');
    } finally {
        setUploadingStory(false);
    }
  };

  const deleteStory = async (id: number) => {
      if(!confirm("Apagar story?")) return;
      try {
          await api.delete(`/stories/${id}`);
          setStories(stories.filter(s => s.id !== id));
      } catch(e) { alert("Erro ao apagar"); }
  }

  if (loading) return <Loader2 className="animate-spin mx-auto mt-20" />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Status Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm">Bem-vinda de volta!</p>
        </div>
        <button 
          onClick={toggleStatus}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all shadow-lg transform active:scale-95 ${
            isOnline ? 'bg-green-500 hover:bg-green-400 text-white' : 'bg-dark-600 hover:bg-dark-500 text-gray-300'
          }`}
        >
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-500'}`} />
          {isOnline ? 'VOCÊ ESTÁ ONLINE' : 'VOCÊ ESTÁ OFFLINE'}
        </button>
      </div>

      {/* Stories Management (New V96) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-primary-500 flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary-500" />
            </div>
            Meus Stories
        </h2>
        
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-dark-600">
            {/* Botão de Adicionar */}
            <div className="flex-shrink-0 w-32 h-48 bg-dark-800 border-2 border-dashed border-dark-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-dark-700 transition-all relative">
                {uploadingStory ? (
                    <Loader2 className="animate-spin text-primary-500" />
                ) : (
                    <>
                        <Plus className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-400 font-bold">Novo Story</span>
                    </>
                )}
                <input 
                    type="file" 
                    accept="image/*,video/*" 
                    onChange={handlePostStory} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    disabled={uploadingStory}
                />
            </div>

            {/* Lista de Stories Ativos */}
            {stories.map(story => (
                <div key={story.id} className="flex-shrink-0 w-32 h-48 bg-dark-800 rounded-xl border border-dark-700 relative group overflow-hidden">
                    <img src={story.media_url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                    <button 
                        onClick={() => deleteStory(story.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs font-bold text-white shadow-black drop-shadow-md">
                        <Eye className="w-3 h-3" /> 0
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-green-500/20 rounded-xl text-green-400"><DollarSign /></div>
            <span className="text-gray-400 font-medium">Ganhos Hoje</span>
          </div>
          <p className="text-3xl font-black text-white">R$ {Number(stats.earnings).toFixed(2)}</p>
        </div>
        
        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Users /></div>
            <span className="text-gray-400 font-medium">Visualizações</span>
          </div>
          <p className="text-3xl font-black text-white">{stats.views}</p>
        </div>

        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400"><Clock /></div>
            <span className="text-gray-400 font-medium">Minutos em Call</span>
          </div>
          <p className="text-3xl font-black text-white">{Math.floor(stats.calls_duration / 60)}m</p>
        </div>
      </div>
    </div>
  );
}
