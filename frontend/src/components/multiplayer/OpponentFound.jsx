import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function OpponentFound({ user, opponent, onReady }) {
  const [isReady, setIsReady] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [opponentReady, setOpponentReady] = useState(false);

  // Auto-ready countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!isReady) {
            handleReady();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isReady]);

  const handleReady = () => {
    setIsReady(true);
    onReady();
  };

  const ratingDiff = user.rating - opponent.rating;
  const getRatingMessage = () => {
    if (Math.abs(ratingDiff) <= 50) return "🤝 Evenly matched! This will be a close one.";
    if (ratingDiff > 50 && ratingDiff <= 200) return "💪 You have a slight ELO edge. Focus!";
    if (ratingDiff < -50 && ratingDiff >= -200) return "⚡ Underdog alert! Catch them by surprise.";
    if (ratingDiff > 200) return "👑 You are favored to win. Don't lose concentration.";
    return "🔥 Huge challenge ahead. Give it everything!";
  };

  // ELO balance slider percentage
  const totalRating = user.rating + opponent.rating;
  const myRatio = totalRating > 0 ? (user.rating / totalRating) * 100 : 50;

  return (
    <div className="setup-container" style={{ margin: '1.5rem auto 0', maxWidth: '650px', textAlign: 'center' }}>
      
      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.8rem', color: 'var(--accent-rose)', filter: 'drop-shadow(0 0 10px var(--accent-rose-glow))' }}>
        ⚔️ OPPONENT FOUND! ⚔️
      </h2>

      {/* Versus Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr 1.5fr', alignItems: 'center', gap: '1rem', margin: '2rem 0' }}>
        
        {/* Your Profile Card */}
        <div style={{ border: 'var(--border-glow)', borderRadius: 'var(--radius-md)', padding: '1.5rem 1rem', backgroundColor: 'var(--bg-card-alt)' }}>
          <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>{user.avatar || '🦁'}</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.1rem', margin: '0.75rem 0 0.25rem 0' }}>
            {user.playerName}
          </h3>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
            ⭐ {user.rating} ELO
          </span>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '0.2rem 0.5rem',
              border: isReady ? '1.5px solid var(--accent-cyan)' : '1.5px dashed #555555',
              color: isReady ? 'var(--accent-cyan)' : '#555555',
              textTransform: 'uppercase',
              borderRadius: 'var(--radius-sm)'
            }}>
              {isReady ? 'READY' : 'PREPARING'}
            </span>
          </div>
        </div>

        {/* VS Label */}
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem' }}>VS</div>

        {/* Opponent Profile Card */}
        <div style={{ border: 'var(--border-glow)', borderRadius: 'var(--radius-md)', padding: '1.5rem 1rem', backgroundColor: 'var(--bg-card-alt)' }}>
          <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>{opponent.avatar}</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.1rem', margin: '0.75rem 0 0.25rem 0' }}>
            {opponent.name}
          </h3>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
            ⭐ {opponent.rating} ELO
          </span>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '0.2rem 0.5rem',
              border: opponentReady ? '1.5px solid var(--accent-cyan)' : '1.5px dashed #555555',
              color: opponentReady ? 'var(--accent-cyan)' : '#555555',
              textTransform: 'uppercase',
              borderRadius: 'var(--radius-sm)'
            }}>
              {opponentReady ? 'READY' : 'PREPARING'}
            </span>
          </div>
        </div>
      </div>

      {/* ELO Comparison bar */}
      <div style={{ margin: '1.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
          <span>Your Rating ({user.rating})</span>
          <span>Opponent ({opponent.rating})</span>
        </div>
        <div style={{ height: '8px', border: 'var(--border-glow)', backgroundColor: 'var(--bg-card)', display: 'flex', overflow: 'hidden', borderRadius: '4px' }}>
          <div style={{ width: `${myRatio}%`, backgroundColor: 'var(--accent-cyan)', boxShadow: '0 0 6px var(--accent-cyan-glow)' }} />
          <div style={{ width: `${100 - myRatio}%`, backgroundColor: '#3f3f46' }} />
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 800 }}>
          {getRatingMessage()}
        </p>
      </div>

      {/* Ready Button and countdown */}
      <div style={{ marginTop: '2rem' }}>
        {!isReady ? (
          <button
            className="btn btn-primary"
            onClick={handleReady}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.25rem',
              background: 'linear-gradient(135deg, var(--accent-rose) 0%, var(--accent-rose-hover) 100%)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              boxShadow: '0 0 15px var(--accent-rose-glow)',
              color: '#000000'
            }}
          >
            ✅ I'M READY! ({secondsLeft}s)
          </button>
        ) : (
          <div style={{ border: '1px dashed rgba(255, 255, 255, 0.15)', padding: '1rem', fontWeight: 800, textTransform: 'uppercase', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card-alt)' }}>
            ⏳ Waiting for opponent to ready...
          </div>
        )}
      </div>

    </div>
  );
}

export default OpponentFound;
