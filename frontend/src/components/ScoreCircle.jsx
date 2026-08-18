import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function ScoreCircle({ score = 0, size = 150, strokeWidth = 8 }) {
  const [offset, setOffset] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    const progressOffset = ((100 - score) / 100) * circumference;
    setOffset(progressOffset);
  }, [score, circumference]);

  const getLabel = (val) => {
    if (val >= 80) return 'EXCELLENT';
    if (val >= 60) return 'GOOD';
    if (val >= 40) return 'NEEDS WORK';
    return 'POOR';
  };

  return (
    <div className="score-circle-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="score-circle-svg">
        <circle
          className="score-circle-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          className="score-circle-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          fill="none"
        />
      </svg>
      <div className="score-text-center">
        <span className="score-num">{score}</span>
        <span className="score-label">{getLabel(score)}</span>
      </div>
    </div>
  );
}

export default ScoreCircle;
