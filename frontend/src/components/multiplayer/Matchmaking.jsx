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

  return (
    <section className="game-panel matchmaking-screen">
      <div className="match-search-icon"><Radio size={40} aria-hidden="true" /></div>
      <h1>{isConnected ? 'Finding your challenger' : 'Connecting to the arena'}</h1>
      <p>{isConnected ? 'Getting your next round ready in your selected language.' : 'Your match will begin once the connection is ready.'}</p>
      <div className="queue-time" aria-label={`Elapsed time ${seconds} seconds`}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</div>
      <div className="queue-detail"><span>{rating} ELO</span><span>{isConnected ? 'Preparing your matchup' : 'Waiting for connection'}</span></div>
      {!isConnected && seconds >= 5 && (
        <StatusNotice tone="error" action={onRetry && <GameButton variant="secondary" onClick={onRetry}><RotateCcw size={16} />Retry</GameButton>}>
          We haven’t connected yet. Retry or return to the lobby.
        </StatusNotice>
      )}
      {isConnected && <p className="matchmaking-tip"><LoaderCircle size={16} className="loading-spinner" aria-hidden="true" />While you wait, think: point, reason, example.</p>}
      <GameButton variant="ghost" onClick={onCancel}>Cancel search</GameButton>
    </section>
  );
}

export default Matchmaking;
