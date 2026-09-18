import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { RatingBadge, getTier } from './RatingBadge';

export function BattleProfile({ user, onBack }) {
  const rating = Number(localStorage.getItem('speakspin-rating')) || 1000;
  const bestRating = Number(localStorage.getItem('speakspin-best-rating')) || rating;
  const wins = Number(localStorage.getItem('speakspin-wins')) || 0;
  const losses = Number(localStorage.getItem('speakspin-losses')) || 0;
  const draws = Number(localStorage.getItem('speakspin-draws')) || 0;
  const streak = Number(localStorage.getItem('speakspin-win-streak')) || 0;

  const battleHistory = JSON.parse(localStorage.getItem('speakspin-battle-history') || '[]');
  const totalBattles = battleHistory.length || (wins + losses + draws);

  const winRate = totalBattles > 0 ? ((wins / totalBattles) * 100).toFixed(1) + '%' : '0.0%';

  // Calculate average score and best score
  const scores = battleHistory.map(h => h.myScore).filter(s => typeof s === 'number');
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

  const tier = getTier(rating);

  return (
    <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '1rem' }}>
      {/* Header Banner */}
      <div
        style={{
          border: '4px solid #ffffff',
          backgroundColor: '#000000',
          padding: '2rem',
          position: 'relative',
          boxShadow: '8px 8px 0px 0px #ffffff',
          marginBottom: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div
            style={{
              fontSize: '4rem',
              width: '100px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#111111',
              border: '3px solid #ffffff',
              boxShadow: '4px 4px 0px 0px #ffffff'
            }}
          >
            {user.avatar}
          </div>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 900,
                fontSize: '2rem',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                lineHeight: '1.1'
              }}
            >
              {user.playerName}
            </h1>
            <p
              style={{
                margin: '0.25rem 0 0.75rem 0',
                color: tier.color,
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                letterSpacing: '0.05em'
              }}
            >
              {tier.title}
            </p>
            <RatingBadge rating={rating} />
          </div>
        </div>

        <Button
          onClick={onBack}
          variant="outline" className="bg-transparent hover:bg-[#111111] text-[#888888] font-black uppercase tracking-widest rounded-none border-2 border-[#333333] px-6 h-12"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            padding: '0.75rem 1.5rem',
            border: '2px solid #ffffff',
            backgroundColor: '#000000',
            color: '#ffffff',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }}
        >
          ⬅️ Back to Lobby
        </Button>
      </div>

      {/* Grid: Stats Blocks */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem'
        }}
      >
        {/* Record Block */}
        <div style={{ border: '2px solid #ffffff', padding: '1.25rem', backgroundColor: '#000000' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '0.25rem' }}>
            Battle Record
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem', color: '#ffffff' }}>
            {wins}W - {losses}L - {draws}D
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', marginTop: '0.2rem', fontWeight: 650 }}>
            Win Rate: {winRate}
          </div>
        </div>

        {/* Win Streak Block */}
        <div style={{ border: '2px solid #ffffff', padding: '1.25rem', backgroundColor: '#000000' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '0.25rem' }}>
            Win Streak
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem', color: streak > 0 ? 'var(--accent-teal)' : '#ffffff' }}>
            🔥 {streak}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Current Consecutive Wins
          </div>
        </div>

        {/* Best Rating Block */}
        <div style={{ border: '2px solid #ffffff', padding: '1.25rem', backgroundColor: '#000000' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '0.25rem' }}>
            Peak Rating
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--accent-pink)' }}>
            ⚡ {bestRating}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            All-Time High ELO
          </div>
        </div>

        {/* Scores Block */}
        <div style={{ border: '2px solid #ffffff', padding: '1.25rem', backgroundColor: '#000000' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '0.25rem' }}>
            Speech Scores
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem', color: '#ffffff' }}>
            {avgScore} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>AVG</span> / {bestScore} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>MAX</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Toastmasters AI Scale
          </div>
        </div>
      </div>

      {/* Battle History Section */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 900,
            fontSize: '1.5rem',
            textTransform: 'uppercase',
            borderBottom: '2px solid #ffffff',
            paddingBottom: '0.5rem',
            marginBottom: '1.5rem'
          }}
        >
          ⚔️ Duel History
        </h2>

        {battleHistory.length === 0 ? (
          <div
            style={{
              border: '2px dashed rgba(255,255,255,0.2)',
              padding: '3rem',
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.2)'
            }}
          >
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>🏆</span>
            <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700, textTransform: 'uppercase', fontSize: '1rem' }}>
              No completed duels found
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Queue up in matchmaking to start competing on the global rankings ladder!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {battleHistory.map((item) => {
              const isWin = item.winner === 'me';
              const isLoss = item.winner === 'opponent';
              const isDraw = item.winner === 'draw';

              let outcomeText = 'DRAW';
              let outcomeColor = 'var(--text-secondary)';
              let borderStyle = '2px solid rgba(255,255,255,0.3)';

              if (isWin) {
                outcomeText = 'VICTORY';
                outcomeColor = 'var(--accent-teal)';
                borderStyle = '2px solid var(--accent-teal)';
              } else if (isLoss) {
                outcomeText = 'DEFEAT';
                outcomeColor = 'var(--accent-pink)';
                borderStyle = '2px solid var(--accent-pink)';
              }

              const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={item.id}
                  style={{
                    border: borderStyle,
                    backgroundColor: '#000000',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    transition: 'transform 0.2s',
                    position: 'relative'
                  }}
                >
                  {/* Top line outcome */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 900,
                          fontSize: '0.9rem',
                          color: outcomeColor,
                          border: `1.5px solid ${outcomeColor}`,
                          padding: '0.15rem 0.5rem',
                          letterSpacing: '0.05em'
                        }}
                      >
                        {outcomeText}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {formattedDate}
                      </span>
                    </div>

                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.85rem' }}>
                      ELO:{' '}
                      <span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: '0.25rem' }}>
                        {item.myRatingBefore}
                      </span>
                      ➡️ <span style={{ color: outcomeColor }}>{item.myRatingAfter}</span>{' '}
                      <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>
                        ({item.ratingChange >= 0 ? `+${item.ratingChange}` : item.ratingChange})
                      </span>
                    </div>
                  </div>

                  {/* Middle Line matching */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      padding: '0.6rem 0'
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>OPPONENT:</span>{' '}
                      <span style={{ fontSize: '1rem', marginRight: '0.25rem' }}>{item.opponent.avatar}</span>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.95rem' }}>
                        {item.opponent.name}
                      </span>{' '}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        ({item.opponent.rating} ELO)
                      </span>
                    </div>

                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1rem' }}>
                      SCORE:{' '}
                      <span style={{ color: isWin ? 'var(--accent-teal)' : '#ffffff' }}>{item.myScore}</span>{' '}
                      <span style={{ opacity: 0.3 }}>vs</span>{' '}
                      <span style={{ color: isLoss ? 'var(--accent-pink)' : '#ffffff' }}>
                        {item.opponentScore}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Line Details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Topic: <span style={{ color: '#ffffff', fontWeight: 650 }}>"{item.topic}"</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                      🏷️ {item.category}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BattleProfile;
