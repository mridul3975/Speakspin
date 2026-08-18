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

      {/* Large Intimidating Battle Mode Featured Card matching the reference design */}
      <motion.div
        className="landing-card"
        variants={itemVariants}
        style={{
          width: '100%',
          maxWidth: '650px',
          margin: '3rem auto',
          padding: '3rem 2.5rem',
          border: '3px solid #ffffff',
          backgroundColor: '#0a0101',
          textAlign: 'center',
          boxShadow: 'none',
          borderRadius: '0px'
        }}
      >
        {/* Crossed Swords with Red Glow */}
        <span 
          className="material-symbols-outlined" 
          style={{ 
            fontSize: '5rem', 
            display: 'block', 
            margin: '0 auto 1.5rem', 
            color: '#c0c0c0',
            filter: 'drop-shadow(0 0 15px rgba(255, 0, 0, 0.95))',
            fontVariationSettings: "'FILL' 1"
          }}
        >
          swords
        </span>

        {/* Start Battle Solid Red Banner Button */}
        <button
          onClick={onStartBattle}
          style={{
            width: '100%',
            backgroundColor: '#e60000',
            color: '#ffffff',
            border: '3px solid #ffffff',
            fontSize: '2.5rem',
            padding: '0.75rem 1rem',
            fontWeight: 900,
            fontFamily: 'var(--font-heading)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            display: 'block',
            marginBottom: '2rem',
            borderRadius: '0px',
            transition: 'transform 0.1s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.99)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          START BATTLE
        </button>

        {/* Capitalized Description Text */}
        <p style={{ 
          fontSize: '0.9rem', 
          color: '#ffffff', 
          lineHeight: '1.6', 
          margin: 0, 
          textTransform: 'uppercase', 
          fontWeight: 900, 
          letterSpacing: '0.08em',
          fontFamily: 'var(--font-heading)'
        }}>
          DUEL REAL SPEAKERS LIVE. CLIMB THE ELO LADDER.<br />
          PROVE YOUR SPEECH DOMINANCE.
        </p>
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
            boxShadow: 'none',
            borderRadius: '0px'
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
