import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function ScoreCircle({ score = 0, size = 150, strokeWidth = 10 }) {
  const [offset, setOffset] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    // Animate fill on mount
    const progressOffset = ((100 - score) / 100) * circumference;
    setOffset(progressOffset);
  }, [score, circumference]);

  const getColor = (val) => {
    if (val >= 80) return '#4ECDC4'; // teal
    if (val >= 60) return '#FFEAA7'; // yellow
    if (val >= 40) return '#FFA502'; // orange
    return '#FF6B6B'; // red
  };

  const getLabel = (val) => {
    if (val >= 80) return 'Great';
    if (val >= 60) return 'Good';
    if (val >= 40) return 'Needs Work';
    return 'Keep Trying';
  };

  const strokeColor = getColor(score);

  return (
    <div className="score-circle-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="score-circle-svg">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Animated value stroke circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {/* Inner score label */}
      <div className="score-circle-inner">
        <span className="score-value" style={{ color: strokeColor }}>{score}</span>
        <span className="score-label">{getLabel(score)}</span>
      </div>
    </div>
  );
}
export default ScoreCircle;
