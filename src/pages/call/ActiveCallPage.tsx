import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import '@livekit/components-styles';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';

export default function ActiveCallPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(state?.token);
  const [url, setUrl] = useState(state?.url);

  useEffect(() => {
    if (!token || !url) {
        alert("Sessão de chamada inválida");
        navigate('/dashboard');
    }
  }, [token, url, navigate]);

  if (!token) return <Loader2 className="animate-spin" />;

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={url}
      data-lk-theme="default"
      style={{ height: '100vh' }}
      onDisconnected={() => navigate('/dashboard')}
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
