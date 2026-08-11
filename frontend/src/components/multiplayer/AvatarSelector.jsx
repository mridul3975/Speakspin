import React from 'react';

const AVATARS = [
  '🦁', '🐯', '🦊', '🐺', '🦅', '🦄', '🔥', '⚡', '💎', '🎯',
  '🚀', '👑', '🌟', '💪', '🎭', '🗡️', '🛡️', '🌊', '🎪', '🤖'
];

export function AvatarSelector({ selectedAvatar, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
      {AVATARS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          style={{
            fontSize: '2rem',
            padding: '0.5rem',
            border: selectedAvatar === emoji ? '3px solid #ffffff' : '2px solid #333333',
            background: selectedAvatar === emoji ? 'rgba(255,255,255,0.1)' : 'transparent',
            cursor: 'pointer',
            transition: 'transform 0.1s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export default AvatarSelector;
