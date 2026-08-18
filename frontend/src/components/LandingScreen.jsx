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

      {/* Large Intimidating Battle Mode Featured Card */}
      <motion.div
        className="landing-card"
        variants={itemVariants}
        style={{
          width: '100%',
          maxWidth: '650px',
          margin: '3rem auto',
          padding: '4rem 2.5rem',
          border: '5px solid #880000',
          boxShadow: '12px 12px 0px 0px #880000',
          backgroundColor: '#1a0000',
          textAlign: 'center'
        }}
      >
        <span style={{ fontSize: '4.5rem', display: 'block', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px #ff3333)' }}>⚔️</span>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2.5rem', textTransform: 'uppercase', color: '#ff3333', letterSpacing: '0.1em', marginBottom: '1rem', lineHeight: '1.1' }}>
          ENTER BATTLE
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#ffcccc', lineHeight: '1.5', marginBottom: '2.5rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
          Duel real speakers live. Climb the ELO ladder. Prove your speech dominance.
        </p>
        <button
          className="btn"
          onClick={onStartBattle}
          style={{
            width: '100%',
            backgroundColor: '#ff3333',
            color: '#ffffff',
            borderColor: '#ff3333',
            fontSize: '1.25rem',
            padding: '1.1rem',
            boxShadow: '6px 6px 0px 0px #ffffff',
            fontWeight: 900,
            fontFamily: 'var(--font-heading)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
        >
          START BATTLE
        </button>
      </motion.div>

      {/* Action buttons */}
      <motion.div className="landing-actions" variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '350px', margin: '0 auto' }}>
        <motion.button
          className="btn btn-secondary"
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '0.8rem',
            borderColor: '#333333',
            color: '#888888',
            background: 'transparent',
            boxShadow: 'none'
          }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
        >
          <span className="material-symbols-outlined text-xs">rocket_launch</span>
          Practice Solo (Training Mode)
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default LandingScreen;
