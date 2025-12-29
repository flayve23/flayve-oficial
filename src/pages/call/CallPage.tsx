import { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  useTracks,
  RoomAudioRenderer,
  ControlBar,
  useRoomContext,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api.ts';
import { Loader2, Clock, DollarSign } from 'lucide-react';
import GiftSelector from '@/components/ui/GiftSelector';
import RechargeModal from '@/components/ui/RechargeModal';

export default function CallPage() {
  const { id: streamerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  
  const [pricePerMinute, setPricePerMinute] = useState(0);
  const [balance, setBalance] = useState(0);
  const [showRecharge, setShowRecharge] = useState(false);
  const [missingAmount, setMissingAmount] = useState(0);
  const [lastGift, setLastGift] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data: streamers } = await api.get('/profiles');
        const streamer = streamers.find((s: any) => s.id === Number(streamerId));
        if (streamer) setPricePerMinute(streamer.price_per_minute);

        const { data: wallet } = await api.get('/wallet/balance');
        setBalance(wallet.balance);

        const minRequired = streamer?.price_per_minute || 5;

        if (wallet.balance < minRequired) {
          setMissingAmount(10);
          setShowRecharge(true);
          return;
        }

        const generatedRoomName = `room-${streamerId}-${user?.id}`;
        const { data } = await api.post('/livekit/token', {
          roomName: generatedRoomName,
        });

        if (data.token) {
          setToken(data.token);
        } else if (data.mockToken) {
            alert("Modo Dev: Chaves do LiveKit não configuradas.");
            navigate('/dashboard/viewer');
        }

      } catch (error) {
        console.error('Erro ao iniciar:', error);
        navigate('/dashboard/viewer');
      }
    };

    if (user && streamerId) {
      fetchDetails();
    }
  }, [user, streamerId, navigate]);

  if (!token && !showRecharge) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center bg-dark-900 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500 mb-4" />
        <h2 className="text-xl font-bold">Verificando saldo e conectando...</h2>
      </div>
    );
  }

  if (!token && showRecharge) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center bg-dark-900 text-white">
        <RechargeModal 
          isOpen={showRecharge}
          onClose={() => navigate('/dashboard/viewer')}
          onSuccess={() => { setShowRecharge(false); window.location.reload(); }}
          missingAmount={missingAmount}
        />
      </div>
    );
  }

  return (
    <div className="h-dvh w-full bg-black relative overflow-hidden">
      {lastGift && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none animate-in zoom-in fade-in duration-300">
          <span className="text-9xl filter drop-shadow-2xl animate-bounce">{lastGift}</span>
        </div>
      )}

      <div className="relative z-[9999]">
        <RechargeModal 
          isOpen={showRecharge}
          onClose={() => setShowRecharge(false)}
          onSuccess={(newBalance) => { setBalance(newBalance); setShowRecharge(false); }}
          missingAmount={missingAmount}
        />
      </div>

      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={import.meta.env.VITE_LIVEKIT_URL || "wss://demo.livekit.cloud"}
        data-lk-theme="default"
        style={{ height: '100%' }}
        onDisconnected={() => navigate('/dashboard/viewer')}
      >
        <MyVideoConference />
        <RoomAudioRenderer />
        <div className="absolute bottom-0 left-0 right-0 z-[30]">
           <ControlBar variation="minimal" />
        </div>
        <BillingOverlay pricePerMinute={pricePerMinute} initialBalance={balance} />
        {streamerId && (
          <GiftSelector 
            streamerId={streamerId}
            onLowBalance={(amount) => { setMissingAmount(amount); setShowRecharge(true); }}
            onSuccess={(icon) => { 
              setLastGift(icon); 
              setTimeout(() => setLastGift(null), 2000); 
            }}
          />
        )}
      </LiveKitRoom>
    </div>
  );
}

function BillingOverlay({ pricePerMinute, initialBalance }: { pricePerMinute: number, initialBalance: number }) {
  const [seconds, setSeconds] = useState(0);
  const [cost, setCost] = useState(0);
  const room = useRoomContext();
  
  useEffect(() => {
    if (room.state !== 'connected') return;
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [room.state]);

  useEffect(() => {
    const currentCost = (seconds / 60) * pricePerMinute;
    setCost(currentCost);
    if (currentCost >= initialBalance) {
      room.disconnect();
      alert('Seu saldo acabou!');
    }
  }, [seconds, pricePerMinute, initialBalance, room]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl text-white border border-white/10 z-50 shadow-lg">
      <div className="flex items-center gap-3 text-sm md:text-base">
        <div className="text-right">
          <div className="flex items-center gap-1 font-mono font-bold">
            <Clock className="h-3 w-3 text-primary-500" />
            {formatTime(seconds)}
          </div>
        </div>
        <div className="w-px h-6 bg-white/20"></div>
        <div className="text-right">
          <div className="flex items-center gap-1 font-mono font-bold text-yellow-400">
            <DollarSign className="h-3 w-3" />
            {cost.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  return (
    <GridLayout tracks={tracks} style={{ height: '100%' }}>
      <ParticipantTile />
    </GridLayout>
  );
}
