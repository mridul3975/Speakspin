import React, { useEffect, useState } from 'react';
import { LoaderCircle, Radio, RotateCcw } from 'lucide-react';
import { GameButton, StatusNotice } from '../game/GameUI';
import { releaseBattleMicrophone } from './battleMicrophone';

export function Matchmaking({ isConnected, rating, onCancel, onRetry }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    releaseBattleMicrophone();
    const timer = setInterval(() => setSeconds(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return <section className="battle-scene battle-search">
    <div className="battle-search-copy"><h1>{isConnected ? 'Your next challenger awaits.' : 'Opening the arena.'}</h1><p>{isConnected ? 'Getting your next round ready in your selected language.' : 'Your match will begin once the connection is ready.'}</p>
      <div className="battle-search-status"><Radio size={20} /><div><strong>{isConnected ? 'Finding your match' : 'Connecting'}</strong><span>{rating} ELO · {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')} elapsed</span></div><LoaderCircle className="loading-spinner" size={18} aria-hidden="true" /></div>
      {!isConnected && seconds >= 5 && <StatusNotice tone="error" action={onRetry && <GameButton variant="secondary" onClick={onRetry}><RotateCcw size={16} />Retry</GameButton>}>We haven’t connected yet. Retry or return to the lobby.</StatusNotice>}
      <GameButton variant="secondary" onClick={onCancel}>Cancel search</GameButton>
      {isConnected && <p className="battle-small-copy">While you wait: a point, a reason, an example.</p>}
    </div>
    <div className="battle-search-art"><img src="/images/game/battle-duel.webp" alt="" width="960" height="640" /></div>
  </section>;
}
export default Matchmaking;
