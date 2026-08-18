import React from 'react';
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
          border: 'var(--border-glow)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'blur(12px)',
          padding: '2rem',
          position: 'relative',
          boxShadow: 'var(--shadow)',
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
              fontSize: '4.5rem',
              width: '100px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-card-alt)',
              border: 'var(--border-glow)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow)'
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

        <button
          onClick={onBack}
          className="btn btn-secondary"
        >
          ⬅️ Back to Lobby
        </button>
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
        <div style={{ border: 'var(--border-glow)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: 'var(--bg-card-alt)' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '0.25rem' }}>
            Battle Record
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
            {wins}W - {losses}L - {draws}D
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.2rem', fontWeight: 650 }}>
            Win Rate: {winRate}
          </div>
        </div>

        {/* Win Streak Block */}
        <div style={{ border: 'var(--border-glow)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: 'var(--bg-card-alt)' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '0.25rem' }}>
            Win Streak
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem', color: streak > 0 ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
            🔥 {streak}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Current Consecutive Wins
          </div>
        </div>

        {/* Best Rating Block */}
        <div style={{ border: 'var(--border-glow)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: 'var(--bg-card-alt)' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '0.25rem' }}>
            Peak Rating
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--accent-rose)' }}>
            ⚡ {bestRating}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            All-Time High ELO
          </div>
        </div>

        {/* Scores Block */}
        <div style={{ border: 'var(--border-glow)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: 'var(--bg-card-alt)' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '0.25rem' }}>
            Speech Scores
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
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
            borderBottom: 'var(--border-glow)',
            paddingBottom: '0.5rem',
            marginBottom: '1.5rem',
            color: 'var(--accent-cyan)',
            borderRadius: '0px'
          }}
        >
          ⚔️ Duel History
        </h2>

        {battleHistory.length === 0 ? (
          <div
            style={{
              border: '2px dashed rgba(255,255,255,0.15)',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-card-alt)'
            }}
          >
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem', color: 'var(--accent-cyan)', filter: 'drop-shadow(0 0 5px var(--accent-cyan-glow))' }}>🏆</span>
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
              let borderStyle = 'var(--border-glow)';

              if (isWin) {
                outcomeText = 'VICTORY';
                outcomeColor = 'var(--accent-cyan)';
                borderStyle = '1px solid var(--accent-cyan)';
              } else if (isLoss) {
                outcomeText = 'DEFEAT';
                outcomeColor = 'var(--accent-rose)';
                borderStyle = '1px solid var(--accent-rose)';
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
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-card-alt)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
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
                      borderTop: 'var(--border-glow)',
                      borderBottom: 'var(--border-glow)',
                      padding: '0.6rem 0',
                      borderRadius: '0px'
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
                      <span style={{ color: isWin ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>{item.myScore}</span>{' '}
                      <span style={{ opacity: 0.3 }}>vs</span>{' '}
                      <span style={{ color: isLoss ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
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
