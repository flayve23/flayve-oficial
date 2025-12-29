import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api.ts';
import { Loader2 } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'viewer' as 'viewer' | 'streamer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/signup', formData);
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4 py-12">
      <div className="max-w-md w-full bg-dark-800 rounded-xl border border-dark-700 shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Crie sua conta</h2>
          <p className="text-gray-400">Junte-se ao Flayve hoje</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex p-1 bg-dark-900 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'viewer' })}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              formData.role === 'viewer'
                ? 'bg-dark-700 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Quero Assistir (Viewer)
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'streamer' })}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              formData.role === 'streamer'
                ? 'bg-primary-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Quero Transmitir (Streamer)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nome de Usuário</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="seu_nome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Senha</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Criar Conta'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
