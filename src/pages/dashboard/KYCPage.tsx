import { useState, useEffect } from 'react';
import api from '../../services/api.ts';
import { Loader2, ShieldCheck, Upload, AlertCircle } from 'lucide-react';

export default function KYCPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'not_submitted' | 'pending' | 'approved' | 'rejected'>('not_submitted');
  const [formData, setFormData] = useState({
    full_name: '',
    cpf: '',
    birth_date: ''
  });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const { data } = await api.get('/streamer/kyc');
      if (data && data.status) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Erro ao verificar KYC', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/streamer/kyc', formData);
      setStatus('pending');
      alert('Documentos enviados com sucesso! Aguarde a aprovação.');
    } catch (error) {
      alert('Erro ao enviar documentos.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  if (status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-4 bg-dark-800 rounded-xl border border-yellow-500/30">
        <ShieldCheck className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Verificação em Análise</h2>
        <p className="text-gray-400">Recebemos seus documentos. O prazo de análise é de até 24 horas úteis.</p>
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-4 bg-dark-800 rounded-xl border border-green-500/30">
        <ShieldCheck className="h-16 w-16 mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Conta Verificada</h2>
        <p className="text-gray-400">Você já pode realizar saques e receber o selo de verificado.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Verificação de Identidade (KYC)</h1>
        <p className="text-gray-400">Obrigatório para realizar saques na plataforma.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-dark-800 p-8 rounded-xl border border-dark-700 space-y-6">
        <div className="bg-primary-900/20 p-4 rounded-lg flex gap-3 items-start border border-primary-500/20">
          <AlertCircle className="h-5 w-5 text-primary-400 mt-0.5" />
          <p className="text-sm text-primary-200">
            Seus dados são protegidos e usados apenas para validação legal. 
            Não compartilhamos com terceiros exceto para processamento de pagamentos.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Nome Completo (igual ao documento)</label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">CPF</label>
            <input
              type="text"
              required
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Data de Nascimento</label>
            <input
              type="date"
              required
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        <div className="border-2 border-dashed border-dark-600 rounded-lg p-8 text-center hover:bg-dark-700/50 transition-colors cursor-pointer">
          <Upload className="h-8 w-8 mx-auto text-gray-500 mb-2" />
          <p className="text-gray-400 font-medium">Upload Documento (Frente e Verso)</p>
          <p className="text-xs text-gray-600 mt-1">Simulação: O envio de arquivos está desativado no Sandbox.</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-lg transition-all flex items-center justify-center"
        >
          {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Enviar para Análise'}
        </button>
      </form>
    </div>
  );
}
