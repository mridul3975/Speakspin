import React from 'react';
import { motion } from 'framer-motion';

export function BattleResult({ user, results, onBattleAgain, onGoHome }) {
  const { winnerName, p1, p2 } = results;

  // Determine if this user won, lost, or drew
  const localName = user.name || 'Guest Speaker';
  const isWinner = winnerName === localName;
  const isDraw = winnerName === 'Draw';

  return (
    <div className="setup-container" style={{ margin: '1.5rem auto 0', maxWidth: '750px' }}>
      {/* Header */}
      <div className="setup-header" style={{ textAlign: 'center' }}>
        <span className="winner-category-tag">BATTLE COMPLETED</span>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.5rem' }}>
          {isDraw ? '🤝 DRAW BATTLE' : (isWinner ? '🏆 YOU WON!' : '💀 YOU LOST')}
        </h2>
        {!isDraw && (
          <p style={{ fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Winner: {winnerName}
          </p>
        )}
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', margin: '1rem 0' }}>
        {/* Player 1 Card (User) */}
        <div style={{ border: isWinner ? '4px solid #ffffff' : '2px solid #ffffff', padding: '1.5rem', backgroundColor: 'var(--bg-card)', position: 'relative' }}>
          {isWinner && (
            <span style={{ position: 'absolute', top: '-12px', left: '12px', background: '#ffffff', color: '#000000', fontSize: '0.7rem', padding: '0.2rem 0.5rem', fontWeight: 900, textTransform: 'uppercase' }}>
              WINNER
            </span>
          )}
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>PLAYER 1 (YOU)</span>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.25rem', margin: '0.25rem 0' }}>{p1.name}</h3>
          
          <div style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{p1.score}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 800 }}>/100</span>
          </div>

          <div style={{ borderTop: '1px solid #ffffff', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>SPEECH LOG</span>
            <p style={{ fontSize: '0.85rem', fontStyle: 'italic', lineHeight: '1.5', color: 'var(--text-secondary)', maxHeight: '150px', overflowY: 'auto' }}>
              "{p1.transcript}"
            </p>
          </div>
        </div>

        {/* Player 2 Card (Opponent) */}
        <div style={{ border: (!isWinner && !isDraw) ? '4px solid #ffffff' : '2px solid #ffffff', padding: '1.5rem', backgroundColor: 'var(--bg-card)', position: 'relative' }}>
          {(!isWinner && !isDraw) && (
            <span style={{ position: 'absolute', top: '-12px', left: '12px', background: '#ffffff', color: '#000000', fontSize: '0.7rem', padding: '0.2rem 0.5rem', fontWeight: 900, textTransform: 'uppercase' }}>
              WINNER
            </span>
          )}
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>PLAYER 2</span>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.25rem', margin: '0.25rem 0' }}>{p2.name}</h3>
          
          <div style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{p2.score}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 800 }}>/100</span>
          </div>

          <div style={{ borderTop: '1px solid #ffffff', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>SPEECH LOG</span>
            <p style={{ fontSize: '0.85rem', fontStyle: 'italic', lineHeight: '1.5', color: 'var(--text-secondary)', maxHeight: '150px', overflowY: 'auto' }}>
              "{p2.transcript}"
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
        <button className="btn btn-primary" onClick={onBattleAgain}>
          <span className="material-symbols-outlined text-sm">replay</span> BATTLE AGAIN
        </button>
        <button className="btn btn-secondary" onClick={onGoHome}>
          <span className="material-symbols-outlined text-sm">home</span> EXIT BATTLE
        </button>
      </div>
    </div>
  );
}

export default BattleResult;
