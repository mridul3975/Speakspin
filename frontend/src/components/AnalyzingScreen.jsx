import React from 'react';
import { motion } from 'framer-motion';

export function AnalyzingScreen() {
  const statusLines = [
    { text: 'Checking fluency & filler words...', icon: 'spellcheck', delay: 0.2 },
    { text: 'Analyzing structure & relevance...', icon: 'psychology', delay: 0.7 },
    { text: 'Evaluating confidence indicators...', icon: 'leaderboard', delay: 1.2 },
  ];

  return (
    <div className="analyzing-container">
      {/* Brutalist loader element */}
      <motion.div
        className="analyzing-robot"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: 'linear',
        }}
      >
        <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>sync</span>
      </motion.div>

      <h2 className="analyzing-title">Analyzing Your Speech</h2>
      
      <div className="analyzing-steps">
        {statusLines.map((line, idx) => (
          <motion.div
            key={idx}
            className="analyzing-step"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: [0.35, 1, 0.35],
              y: 0,
            }}
            transition={{
              y: { delay: line.delay, duration: 0.4 },
              opacity: {
                delay: line.delay,
                repeat: Infinity,
                duration: 2,
                ease: 'easeInOut',
              },
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <span className="material-symbols-outlined text-md">{line.icon}</span>
            <span>{line.text.toUpperCase()}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default AnalyzingScreen;
