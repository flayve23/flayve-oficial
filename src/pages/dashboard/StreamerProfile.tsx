import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Loader2, Save } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';

export default function StreamerProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    bio: '',
    price_per_minute: 1.99,
    photo_url: '',
    is_online: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profiles/me');
      setFormData({
        bio: data.bio || '',
        price_per_minute: data.price_per_minute || 1.99,
        photo_url: data.photo_url || '',
        is_online: Boolean(data.is_online)
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      await api.put('/profiles/me', formData);
      setMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Erro ao salvar perfil.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Editar Perfil</h1>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-dark-800 p-6 rounded-xl border border-dark-700">
        
        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-dark-900 rounded-lg">
          <div>
            <h3 className="font-medium text-white">Status Online</h3>
            <p className="text-sm text-gray-400">Aparecer no topo do feed agora?</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.is_online} 
              onChange={(e) => setFormData({...formData, is_online: e.target.checked})} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        {/* Preço */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Preço por Minuto (R$)</label>
          <input
            type="number"
            step="0.01"
            min="1.99"
            max="300.00"
            required
            value={formData.price_per_minute}
            onChange={(e) => setFormData({ ...formData, price_per_minute: parseFloat(e.target.value) })}
            className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">Mínimo R$ 1,99. Máximo R$ 300,00.</p>
        </div>

        {/* Foto de Perfil */}
        <div className="h-64 w-full md:w-1/2">
          <ImageUpload
            type="profile"
            label="Foto de Perfil"
            currentUrl={formData.photo_url}
            onUpload={(url) => setFormData({ ...formData, photo_url: url })}
            className="h-full"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Biografia</label>
          <textarea
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            placeholder="Conte um pouco sobre você..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <><Save className="h-5 w-5" /> Salvar Alterações</>}
        </button>
      </form>
    </div>
  );
}
