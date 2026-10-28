import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Flame, Handshake, MessageCircle, RotateCcw, ThumbsUp, Trophy } from 'lucide-react';
import { GameButton, PlayerAvatar, StatusNotice } from '../game/GameUI';
import { playWinnerFanfare, playLoserSound, playReactionPop, playRatingUp, playRatingDown } from '../../utils/battleAudio';
import { prepareBattleMicrophone } from './battleMicrophone';
const REACTIONS = [{
  value: '👏',
  label: 'Well played',
  Icon: ThumbsUp
}, {
  value: '🤝',
  label: 'Good game',
  Icon: Handshake
}, {
  value: '🔥',
  label: 'Great round',
  Icon: Flame
}];
const readHistory = () => {
  try {
    const value = JSON.parse(localStorage.getItem('speakspin-battle-history') || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};
const categoryName = value => value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, character => character.toUpperCase());
export function BattleResults({
  results,
  myPosition,
  onSendReaction,
  onRematch,
  onNewOpponent,
  onLeave
}) {
  const me = (myPosition === 'player1' ? results?.player1 : results?.player2) || {};
  const opponent = (myPosition === 'player1' ? results?.player2 : results?.player1) || {};
  const mine = Number(me.overallScore || 0);
  const theirs = Number(opponent.overallScore || 0);
  const outcome = mine === theirs ? 'draw' : mine > theirs ? 'win' : 'loss';
  const [rematchRequested, setRematchRequested] = useState(false);
  const [opponentWantsRematch, setOpponentWantsRematch] = useState(false);
  const [preparingMic, setPreparingMic] = useState(false);
  const [error, setError] = useState('');
  const [reaction, setReaction] = useState('');
  const effectRan = useRef(false);
  const mounted = useRef(false);
  const reactionTimeout = useRef(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;
    const history = readHistory();
    const resultKey = String(results?.resultId || `${results?.roomId || ''}|${results?.topic}|${me.name}|${me.rating}|${mine}|${theirs}|${me.transcript}`);
    if (history.some(item => item.resultKey === resultKey)) return;
    const number = key => Number(localStorage.getItem(key) || 0);
    if (outcome === 'win') {
      localStorage.setItem('speakspin-wins', number('speakspin-wins') + 1);
      localStorage.setItem('speakspin-win-streak', number('speakspin-win-streak') + 1);
      playWinnerFanfare();
      playRatingUp();
    } else if (outcome === 'draw') {
      localStorage.setItem('speakspin-draws', number('speakspin-draws') + 1);
      localStorage.setItem('speakspin-win-streak', 0);
    } else {
      localStorage.setItem('speakspin-losses', number('speakspin-losses') + 1);
      localStorage.setItem('speakspin-win-streak', 0);
      playLoserSound();
      playRatingDown();
    }
    const newRating = Number(me.newRating ?? me.rating ?? 1000);
    localStorage.setItem('speakspin-rating', newRating);
    localStorage.setItem('speakspin-best-rating', Math.max(Number(localStorage.getItem('speakspin-best-rating') || 1000), newRating));
    history.unshift({
      id: results?.resultId || Date.now(),
      resultKey,
      date: new Date().toISOString(),
      mode: 'battle',
      opponent: {
        name: opponent.name,
        avatar: opponent.avatar,
        rating: opponent.rating
      },
      topic: results?.topic || '',
      category: results?.category || 'Speech battle',
      myScore: mine,
      opponentScore: theirs,
      winner: outcome === 'win' ? 'me' : outcome === 'loss' ? 'opponent' : 'draw',
      myRatingBefore: me.rating,
      myRatingAfter: newRating,
      ratingChange: me.ratingChange
    });
    localStorage.setItem('speakspin-battle-history', JSON.stringify(history.slice(0, 50)));
  }, [results, me, opponent, mine, theirs, outcome]);
  useEffect(() => {
    const showReaction = event => {
      const value = REACTIONS.find(item => item.value === event.detail?.reaction);
      if (value) {
        setReaction(`${opponent.name || 'Challenger'}: ${value.label}`);
        playReactionPop();
        clearTimeout(reactionTimeout.current);
        reactionTimeout.current = setTimeout(() => setReaction(''), 4000);
      }
    };
    const request = () => setOpponentWantsRematch(true);
    window.addEventListener('socket_reaction', showReaction);
    window.addEventListener('socket_opponent_wants_rematch', request);
    return () => {
      window.removeEventListener('socket_reaction', showReaction);
      window.removeEventListener('socket_opponent_wants_rematch', request);
      clearTimeout(reactionTimeout.current);
    };
  }, [opponent.name]);
  const requestRematch = async () => {
    if (rematchRequested || preparingMic) return;
    setPreparingMic(true);
    setError('');
    try {
      await prepareBattleMicrophone();
      if (!mounted.current) return;
      setRematchRequested(true);
      onRematch();
    } catch {
      if (mounted.current) setError('Your microphone isn’t ready for another round. Check access and try again.');
    } finally {
      if (mounted.current) setPreparingMic(false);
    }
  };
  return <div className="screen-stack battle-results">
    <section className={`game-panel battle-outcome battle-outcome--${outcome}`}>
      <Trophy size={38} aria-hidden="true" /><h1>{outcome === 'win' ? 'Round won.' : outcome === 'draw' ? 'A close match.' : 'A round to build on.'}</h1><p>{outcome === 'win' ? 'Your words made the difference. Ready for another?' : outcome === 'draw' ? 'Level scores. There’s a rematch waiting to happen.' : 'Your challenger takes this one. Find one thing to improve, then go again.'}</p>
      <div className="result-comparison"><div className="result-player"><PlayerAvatar avatar={me.avatar} /><h2 title={me.name || 'You'}>{me.name || 'You'}</h2><strong className="result-score">{mine}<span>/100</span></strong></div><span className="versus-mark">VS</span><div className="result-player result-player--rival"><PlayerAvatar avatar={opponent.avatar} rival /><h2 title={opponent.name || 'Challenger'}>{opponent.name || 'Challenger'}</h2><strong className="result-score">{theirs}<span>/100</span></strong></div></div>
      <div className="rating-change"><span>{me.rating} <ArrowRight size={15} /> {me.newRating} ELO</span><strong className={Number(me.ratingChange) >= 0 ? 'rating-change--positive' : 'rating-change--negative'}>{Number(me.ratingChange) >= 0 ? '+' : ''}{me.ratingChange || 0}</strong></div>
      {opponentWantsRematch && !rematchRequested && <StatusNotice>Your challenger wants a rematch.</StatusNotice>}{error && <StatusNotice tone="error">{error}</StatusNotice>}
      <div className="game-actions">{rematchRequested ? <StatusNotice>Rematch requested. Waiting for your challenger.</StatusNotice> : <GameButton onClick={requestRematch} disabled={preparingMic}><RotateCcw size={17} />{preparingMic ? 'Checking microphone…' : opponentWantsRematch ? 'Accept rematch' : 'Rematch'}</GameButton>}<GameButton variant="secondary" onClick={onNewOpponent}>New opponent<ArrowRight size={17} /></GameButton><GameButton variant="ghost" onClick={onLeave}>Leave arena</GameButton></div>
    </section>
    <section className="game-panel result-details"><h2 className="section-title">Take something into your next round</h2>{me.overallFeedback && <p>{me.overallFeedback}</p>}<div className="feedback-pair">{Array.isArray(me.strengths) && me.strengths.length > 0 && <div><h3>Keep doing</h3><ul>{me.strengths.map((text, index) => <li key={index}>{text}</li>)}</ul></div>}{Array.isArray(me.improvements) && me.improvements.length > 0 && <div><h3>Try next time</h3><ul>{me.improvements.map((text, index) => <li key={index}>{text}</li>)}</ul></div>}</div><details><summary>Your score breakdown</summary><div className="category-score-list">{Object.entries(me.categories || {}).map(([key, value]) => <div key={key}><div><span>{categoryName(key)}</span><strong>{value.score}/100</strong></div><div className="score-track"><span style={{
                width: `${Math.min(100, Math.max(0, Number(value.score) || 0))}%`
              }} /></div>{value.feedback && <p>{value.feedback}</p>}</div>)}</div></details><details><summary>Your transcript</summary><p dir="auto">{me.transcript || 'No transcript was received for this round.'}</p></details></section>
    <section className="reactions-row" aria-label="React to the round"><MessageCircle size={18} aria-hidden="true" /><span>Good game?</span>{REACTIONS.map(({
        value,
        label,
        Icon
      }) => <button className="reaction-choice" key={value} onClick={() => {
        onSendReaction(value);
        setReaction(`You: ${label}`);
        playReactionPop();
        clearTimeout(reactionTimeout.current);
        reactionTimeout.current = setTimeout(() => setReaction(''), 4000);
      }}><Icon size={17} />{label}</button>)}<span className="reaction-status" role="status">{reaction}</span></section>
  </div>;
}
export default BattleResults;
