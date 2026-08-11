import React from 'react';

export function getTier(rating) {
  if (rating < 800) return { name: 'Bronze', emoji: '🥉', color: '#cd7f32', title: 'Shy Whisperer' };
  if (rating < 1000) return { name: 'Silver', emoji: '🥈', color: '#c0c0c0', title: 'Rising Voice' };
  if (rating < 1200) return { name: 'Gold', emoji: '🥇', color: '#ffd700', title: 'Confident Speaker' };
  if (rating < 1400) return { name: 'Diamond', emoji: '💎', color: '#00ffff', title: 'Eloquent Champion' };
  if (rating < 1600) return { name: 'Master', emoji: '🔮', color: '#a020f0', title: 'Speech Master' };
  return { name: 'Legend', emoji: '👑', color: '#ff4500', title: 'Grand Orator' };
}

export function RatingBadge({ rating }) {
  const tier = getTier(rating);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.35rem 0.75rem',
        border: `2px solid ${tier.color}`,
        borderRadius: '0px',
        backgroundColor: 'rgba(0,0,0,0.4)',
        boxShadow: `0 0 10px ${tier.color}44`,
        fontFamily: 'var(--font-heading)',
        fontWeight: 800,
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}
    >
      <span>{tier.emoji}</span>
      <span style={{ color: tier.color }}>{tier.name}</span>
      <span style={{ color: '#ffffff', opacity: 0.6 }}>|</span>
      <span style={{ color: '#ffffff' }}>{rating} ELO</span>
    </div>
  );
}

export default RatingBadge;
