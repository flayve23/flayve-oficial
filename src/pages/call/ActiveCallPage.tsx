import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import '@livekit/components-styles'; // CRITICAL: Import Styles
import { 
    LiveKitRoom, 
    VideoConference, 
    GridLayout, 
    ParticipantTile, 
    useTracks, 
    RoomAudioRenderer,
    ControlBar,
    TrackReferenceOrPlaceholder
} from '@livekit/components-react';
import { Track } from 'livekit-client';

export default function ActiveCallPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(state?.token);
  const [url, setUrl] = useState(state?.url);

  useEffect(() => {
    if (!token || !url) {
        // Try to recover from localStorage if page refreshed? 
        // For MVP, just redirect back to safety.
        alert("Sessão de chamada encerrada ou inválida.");
        navigate('/dashboard');
    }
  }, [token, url, navigate]);

  if (!token) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="h-screen w-screen bg-black relative">
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={url}
            data-lk-theme="default"
            style={{ height: '100%' }}
            onDisconnected={() => navigate('/dashboard')}
        >
            {/* Custom Layout to ensure visibility */}
            <div className="flex flex-col h-full">
                <div className="flex-1 relative">
                    <MyVideoGrid />
                </div>
                <div className="p-4 flex justify-center bg-dark-900/80 backdrop-blur-md absolute bottom-0 w-full z-50">
                    <ControlBar 
                        variation="minimal" 
                        controls={{ 
                            microphone: true, 
                            camera: true, 
                            screenShare: false, 
                            chat: false 
                        }} 
                    />
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="ml-4 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2"
                    >
                        <PhoneOff className="w-4 h-4" /> Sair
                    </button>
                </div>
            </div>
            <RoomAudioRenderer />
        </LiveKitRoom>
    </div>
  );
}

// Custom Grid to debug visual issues
function MyVideoGrid() {
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false }, // Show even if not fully subbed yet
    );

    return (
        <GridLayout tracks={tracks} style={{ height: '100%' }}>
            <ParticipantTile />
        </GridLayout>
    );
}
