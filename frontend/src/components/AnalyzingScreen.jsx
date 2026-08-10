import React from 'react';
import { motion } from 'framer-motion';

export function AnalyzingScreen() {
  const statusLines = [
    { text: '📝 Checking fluency and filler words...', delay: 0.2 },
    { text: '🧠 Analyzing structure and relevance...', delay: 0.7 },
    { text: '💪 Evaluating confidence indicators...', delay: 1.2 },
  ];

  return (
    <div className="analyzing-container">
      {/* Spinning Robot Emoji */}
      <motion.div
        className="analyzing-robot"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: 'linear',
        }}
      >
        🤖
      </motion.div>

      <h2 className="analyzing-title">Analyzing Your Speech...</h2>
      <p className="analyzing-subtitle">Our AI coach is evaluating your performance</p>

      {/* Status lines with stagger and infinite opacity pulse */}
      <div className="analyzing-status-list">
        {statusLines.map((line, idx) => (
          <motion.div
            key={idx}
            className="analyzing-status-item"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: [0.3, 1, 0.3],
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
          >
            {line.text}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default AnalyzingScreen;
