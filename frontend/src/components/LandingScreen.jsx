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

      {/* Large Battle Mode Featured Card */}
      <motion.div
        className="landing-card"
        variants={itemVariants}
        style={{
          width: '100%',
          maxWidth: '500px',
          margin: '2.5rem auto',
          padding: '2.5rem 1.5rem',
          border: '4px solid var(--accent-coral)',
          boxShadow: '8px 8px 0px 0px var(--accent-coral)',
          backgroundColor: '#000000',
          textAlign: 'center'
        }}
      >
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>⚔️</span>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.6rem', textTransform: 'uppercase', color: 'var(--accent-coral)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          BATTLE MODE
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '2rem', textTransform: 'uppercase', fontWeight: 700 }}>
          Duel other users live in real-time or practice with AI bots to rank up.
        </p>
        <button
          className="btn btn-primary"
          onClick={onStartBattle}
          style={{ width: '100%', backgroundColor: 'var(--accent-coral)', color: '#ffffff', borderColor: 'var(--accent-coral)', fontSize: '0.95rem' }}
        >
          START BATTLE
        </button>
      </motion.div>

      {/* Action buttons */}
      <motion.div className="landing-actions" variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
        <motion.button
          className="btn btn-secondary"
          style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
        >
          <span className="material-symbols-outlined text-sm">rocket_launch</span>
          START PRACTICING (SOLO)
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default LandingScreen;
