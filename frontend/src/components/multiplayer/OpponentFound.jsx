import React, { useEffect, useRef, useState } from 'react';
import { Check, Mic, Swords } from 'lucide-react';
import { GameButton, PlayerAvatar, StatusNotice } from '../game/GameUI';
import RatingBadge from './RatingBadge';
import { prepareBattleMicrophone } from './battleMicrophone';
export function OpponentFound({
  user,
  opponent,
  onReady,
  opponentReady = false,
  onCancel
}) {
  const challengerReady = opponentReady || Boolean(opponent?.isBot);
  const [isReady, setIsReady] = useState(false);
  const [checkingMic, setCheckingMic] = useState(false);
  const [micError, setMicError] = useState('');
  const mountedRef = useRef(false);
  const readyRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const handleReady = async () => {
    if (readyRef.current || checkingMic) return;
    setCheckingMic(true);
    setMicError('');
    try {
      await prepareBattleMicrophone();
      if (!mountedRef.current || readyRef.current) return;
      readyRef.current = true;
      setIsReady(true);
      onReady();
    } catch (error) {
      if (mountedRef.current) setMicError(error.name === 'NotAllowedError' ? 'Microphone access is blocked. Allow it in your browser, then try again.' : 'Your microphone isn’t ready. Check that it is connected and try again.');
    } finally {
      if (mountedRef.current) setCheckingMic(false);
    }
  };
  return <section className="game-panel opponent-screen"><h1>Meet your challenger</h1><p>Check your microphone. The topic appears when you’re both ready.</p><div className="versus-grid"><div className="versus-player"><PlayerAvatar avatar={user?.avatar} size="large" /><h2 title={user?.playerName || 'You'}>{user?.playerName || 'You'}</h2><RatingBadge rating={user?.rating} /><span className={`player-ready${isReady ? '' : ' player-ready--waiting'}`}>{isReady ? <Check size={16} /> : <Mic size={16} />}{isReady ? 'Mic ready' : 'Your microphone check'}</span></div><span className="versus-mark"><Swords size={24} aria-hidden="true" /><span>VS</span></span><div className="versus-player versus-player--rival"><PlayerAvatar avatar={opponent?.avatar} rival size="large" /><h2 title={opponent?.name || 'Challenger'}>{opponent?.name || 'Challenger'}</h2><RatingBadge rating={opponent?.rating} /><span className={`player-ready${challengerReady ? '' : ' player-ready--waiting'}`}>{challengerReady ? <Check size={16} /> : <Mic size={16} />}{challengerReady ? 'Ready to speak' : 'Preparing'}</span></div></div>{micError && <StatusNotice tone="error">{micError}</StatusNotice>}<div className="ready-actions">{!isReady ? <GameButton onClick={handleReady} disabled={checkingMic}><Mic size={18} />{checkingMic ? 'Checking microphone…' : 'Check mic & ready up'}</GameButton> : <StatusNotice>Microphone ready. {challengerReady ? 'Your round is about to begin.' : 'Waiting for your challenger.'}</StatusNotice>}{onCancel && <GameButton variant="ghost" onClick={onCancel}>Leave match</GameButton>}</div></section>;
}
export default OpponentFound;
