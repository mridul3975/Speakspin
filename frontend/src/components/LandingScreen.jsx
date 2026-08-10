import React from 'react';
import { motion } from 'framer-motion';

export function LandingScreen({ onStart, onViewProgress }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const cards = [
    { icon: '🎰', title: 'Spin & Speak', desc: 'Random topics to challenge your impromptu skills' },
    { icon: '🎤', title: 'Record', desc: 'Speak for 30s, 1, 2, or 5 minutes to practice pacing' },
    { icon: '🤖', title: 'AI Analysis', desc: 'Get detailed feedback instantly across 8 key speech dimensions' },
  ];

  return (
    <motion.div
      className="landing-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Logo */}
      <motion.div
        className="landing-logo"
        animate={{ y: [0, -10, 0] }}
        transition={{
          repeat: Infinity,
          duration: 2.5,
          ease: 'easeInOut',
        }}
      >
        🎯
      </motion.div>

      {/* Title */}
      <motion.h1 className="landing-title" variants={itemVariants}>
        Speak<span className="text-teal">Spin</span>
      </motion.h1>

      {/* Tagline */}
      <motion.p className="landing-tagline" variants={itemVariants}>
        Master public speaking with AI-powered coaching
      </motion.p>

      {/* Features list */}
      <motion.div className="landing-cards" variants={itemVariants}>
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            className="landing-card"
            whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(78, 205, 196, 0.15)' }}
            variants={itemVariants}
          >
            <div className="card-emoji">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Action buttons */}
      <motion.div className="landing-actions" variants={itemVariants}>
        <motion.button
          className="btn btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
        >
          🚀 Start Speaking
        </motion.button>
        
        <motion.button
          className="btn btn-secondary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onViewProgress}
        >
          📊 View Progress
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default LandingScreen;
