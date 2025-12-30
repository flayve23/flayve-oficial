import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, PhoneOff } from 'lucide-react';
import '@livekit/components-styles';
import { 
    LiveKitRoom, 
    RoomAudioRenderer,
    ControlBar,
    useTracks,
    TrackReference,
    VideoTrack
} from '@livekit/components-react';
import { Track } from 'livekit-client';

export default function ActiveCallPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(state?.token);
  const [url, setUrl] = useState(state?.url);

  useEffect(() => {
    if (!token || !url) {
        alert("Sessão inválida.");
        navigate('/dashboard');
    }
  }, [token, url, navigate]);

  if (!token) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={url}
            data-lk-theme="default"
            style={{ height: '100vh', width: '100vw' }}
            onDisconnected={() => navigate('/dashboard')}
        >
            <ManualVideoGrid />
            <RoomAudioRenderer />
            
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex gap-4">
                <ControlBar variation="minimal" controls={{ microphone: true, camera: true }} />
                <button onClick={() => navigate('/dashboard')} className="bg-red-600 p-3 rounded-full text-white hover:bg-red-500">
                    <PhoneOff />
                </button>
            </div>
        </LiveKitRoom>
    </div>
  );
}

function ManualVideoGrid() {
    // Force get Camera tracks
    const tracks = useTracks([Track.Source.Camera]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full bg-black">
            {tracks.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-500">
                    Aguardando vídeo... (Verifique permissões da câmera)
                </div>
            )}
            {tracks.map((trackRef: TrackReference) => (
                <div key={trackRef.participant.identity} className="relative border border-dark-800 bg-dark-900">
                    {/* The Raw Video Renderer */}
                    <VideoTrack trackRef={trackRef} className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-black/50 px-2 rounded text-white text-sm">
                        {trackRef.participant.name} {trackRef.participant.isLocal && "(Você)"}
                    </div>
                </div>
            ))}
        </div>
    );
}
