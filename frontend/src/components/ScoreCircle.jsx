import React from 'react';

export function ScoreCircle({ score, size = 150, strokeWidth = 8 }) {
  const value = typeof score === 'number' && Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : null;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;
  const label = value === null ? 'Score unavailable' : value >= 80 ? 'Strong round' : value >= 60 ? 'Building momentum' : 'Keep practicing';
  return <div className="score-circle-container" style={{ width: size, height: size }} role="img" aria-label={value === null ? label : `Speech score: ${value} out of 100. ${label}.`}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-raised, #1c3040)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--accent, #63e8e1)" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - (value || 0) / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
    <div className="score-text-center"><span className="score-num">{value === null ? '—' : value}</span><span className="score-label">{value === null ? 'unavailable' : 'out of 100'}</span></div>
  </div>;
}

export default ScoreCircle;
