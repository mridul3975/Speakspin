import React from 'react';
import { ArrowRight, Swords } from 'lucide-react';
import { BackButton, Metric, PageHeading, PlayerAvatar } from '../game/GameUI';
import { RatingBadge, getTier } from './RatingBadge';
const readHistory = () => {
  try {
    const data = JSON.parse(localStorage.getItem('speakspin-battle-history') || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};
export function BattleProfile({
  user,
  onBack
}) {
  const number = (key, fallback = 0) => Number(localStorage.getItem(key) ?? fallback);
  const rating = number('speakspin-rating', 1000);
  const bestRating = number('speakspin-best-rating', rating);
  const wins = number('speakspin-wins');
  const losses = number('speakspin-losses');
  const draws = number('speakspin-draws');
  const history = readHistory();
  const total = wins + losses + draws;
  const tier = getTier(rating);
  const average = history.length ? Math.round(history.reduce((sum, item) => sum + (Number(item.myScore) || 0), 0) / history.length) : '—';
  return <div className="screen-stack battle-profile"><PageHeading title="Your player record" description="Every round is another chance to find your voice." action={<BackButton onClick={onBack}>Lobby</BackButton>} /><section className="game-panel profile-header"><div className="player-identity"><PlayerAvatar avatar={user?.avatar} size="large" /><div><h2>{user?.playerName || 'Guest Speaker'}</h2><p>{tier.title}</p><RatingBadge rating={rating} /></div></div><p className="subtle-copy">Battle record stored in this browser.</p></section><section className="profile-metrics" aria-label="Battle statistics"><Metric value={`${wins} / ${losses} / ${draws}`} label="Wins / losses / draws" /><Metric value={total ? `${Math.round(wins / total * 100)}%` : '—'} label="Win rate" /><Metric value={number('speakspin-win-streak')} label="Current win streak" /><Metric value={bestRating} label="Peak ELO" /><Metric value={average} label="Recent average score" /></section><section className="game-panel"><h2 className="section-title">Recent rounds</h2>{!history.length ? <div className="empty-state"><Swords size={32} aria-hidden="true" /><h3>Your first round is ahead.</h3><p>Find a challenger to start building your battle record.</p><BackButton onClick={onBack}>Open lobby</BackButton></div> : <div className="battle-history-list">{history.map((item, index) => {
          const outcome = item.winner === 'me' ? 'win' : item.winner === 'opponent' ? 'loss' : 'draw';
          const date = new Date(item.date);
          return <article key={item.id || index} className="battle-history-row"><div className="battle-history-opponent"><PlayerAvatar avatar={item.opponent?.avatar} rival size="small" /><div><h3>{item.opponent?.name || 'Challenger'}</h3><time dateTime={item.date}>{Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })}</time></div><span className={`history-outcome history-outcome--${outcome}`}>{outcome === 'win' ? 'Won' : outcome === 'loss' ? 'Lost' : 'Draw'}</span></div><p dir="auto">{item.topic || 'Speech battle'}</p><div className="battle-history-score"><span><strong>{item.myScore}</strong> vs {item.opponentScore}</span><span>{item.myRatingBefore}<ArrowRight size={14} />{item.myRatingAfter} ELO <strong className={Number(item.ratingChange) >= 0 ? 'rating-change--positive' : 'rating-change--negative'}>({Number(item.ratingChange) >= 0 ? '+' : ''}{item.ratingChange || 0})</strong></span></div></article>;
        })}</div>}</section></div>;
}
export default BattleProfile;
