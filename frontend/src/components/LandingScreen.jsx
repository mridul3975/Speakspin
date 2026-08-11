import React from 'react';
import { motion } from 'framer-motion';

export function LandingScreen({ onStart, onViewProgress, onStartBattle }) {
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
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  const cards = [
    { icon: 'casino', title: 'Spin & Speak', desc: 'Random topics to challenge your impromptu skills' },
    { icon: 'mic', title: 'Record', desc: 'Speak for 30s, 1, 2, or 5 minutes to practice pacing' },
    { icon: 'smart_toy', title: 'AI Analysis', desc: 'Get detailed feedback instantly across 8 key speech dimensions' },
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
        animate={{ y: [0, -6, 0] }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: 'easeInOut',
        }}
      >
        <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>track_changes</span>
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
      <motion.div className="landing-cards-grid" variants={itemVariants}>
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            className="landing-card"
            variants={itemVariants}
            whileHover={{ y: -2 }}
          >
            <div className="landing-card-icon">
              <span className="material-symbols-outlined text-4xl">{card.icon}</span>
            </div>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Action buttons */}
      <motion.div className="landing-actions" variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '380px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
          <motion.button
            className="btn btn-primary"
            style={{ flex: 1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
          >
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            Start Speaking
          </motion.button>
          
          <motion.button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewProgress}
          >
            <span className="material-symbols-outlined text-sm">bar_chart</span>
            View Progress
          </motion.button>
        </div>

        <motion.button
          className="btn btn-primary"
          whileTap={{ scale: 0.98 }}
          onClick={onStartBattle}
          style={{
            width: '100%',
            backgroundColor: '#FF416C',
            borderColor: '#FF4B2B',
            boxShadow: '0 0 10px rgba(255,65,108,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800
          }}
        >
          ⚔️ BATTLE MODE
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default LandingScreen;
