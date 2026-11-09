import React, { useEffect, useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { GameButton, StatusNotice } from '../game/GameUI';

export function BattleAnalyzing({ opponentSubmitted, onLeave }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSeconds(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return <section className="battle-scene battle-judging" aria-live="polite">
    <div className="battle-judge-art"><img src="/images/game/rank-crest.webp" alt="" width="547" height="500" /><LoaderCircle size={24} className="loading-spinner" aria-hidden="true" /></div>
    <h1>{opponentSubmitted ? 'Let your words settle.' : 'Your speech is in.'}</h1>
    <p>{opponentSubmitted ? 'The judge is comparing both transcripts and their timing. Your result will appear here.' : 'Your challenger is finishing their response. Keep this window open.'}</p>
    <div className="battle-submissions"><span><Check size={17} />Your speech received</span><span>{opponentSubmitted ? <Check size={17} /> : <LoaderCircle size={17} aria-hidden="true" />}{opponentSubmitted ? 'Challenger speech received' : 'Waiting for challenger'}</span></div>
    {seconds > 75 && <StatusNotice>This is taking longer than usual. You can keep waiting{onLeave ? ' or return to the lobby.' : '.'}</StatusNotice>}
    {onLeave && seconds > 75 && <GameButton variant="secondary" onClick={onLeave}>Return to lobby</GameButton>}
  </section>;
}
export default BattleAnalyzing;
