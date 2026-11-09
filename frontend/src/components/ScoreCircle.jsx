import React from 'react';

export function ScoreCircle({ score, size = 150, strokeWidth = 8 }) {
  const value = typeof score === 'number' && Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : null;
  const label = value === null ? 'Score unavailable' : value >= 80 ? 'Strong round' : value >= 60 ? 'Building momentum' : 'Keep practicing';
  return <div className="score-circle-container score-medallion" style={{ width: size, height: size, '--medal-rim': `${strokeWidth}px` }} role="img" aria-label={value === null ? label : `Speech score: ${value} out of 100. ${label}.`}>
    <div className="score-text-center"><span className="score-num">{value === null ? '—' : value}</span><span className="score-label">{value === null ? 'unavailable' : 'out of 100'}</span></div>
  </div>;
}

export default ScoreCircle;
