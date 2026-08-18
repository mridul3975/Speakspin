import React from 'react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

export function SignupPrompt({ onLoginSuccess, onLoginError, onSkip }) {
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  const benefits = [
    { icon: 'bar_chart', title: 'Permanent Speech Logs', desc: 'Track your fluency, pacing, and AI coach feedback history.' },
    { icon: 'leaderboard', title: 'Global Leaderboards', desc: 'Climb the tiers, preserve your ELO, and showcase your rank.' },
    { icon: 'military_tech', title: 'Achievement Badges', desc: 'Unlock badges for speech milestones and competitive win streaks.' },
    { icon: 'settings', title: 'Advanced Practice Modes', desc: 'Access topic categories, duration filters, and deep analytics.' }
  ];

  return (
    <div className="setup-container" style={{ margin: '1.5rem auto 0', maxWidth: '600px', textAlign: 'center' }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          border: '3px solid #ffffff',
          backgroundColor: '#0a0101',
          padding: '2.5rem 2rem',
          boxShadow: '8px 8px 0px 0px var(--accent-coral)',
          textAlign: 'center',
          borderRadius: '0px'
        }}
      >
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🏆</span>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.6rem', textTransform: 'uppercase', color: 'var(--accent-coral)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Claim Your permanent Profile
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '2.5rem' }}>
          Don't lose your progress! Sign up now to save your ratings and unlock competitive public speaking features.
        </p>

        {/* Benefits Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', textAlign: 'left', marginBottom: '2.5rem' }}>
          {benefits.map((b, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--accent-coral)', padding: '0.2rem' }}>
                {b.icon}
              </span>
              <div>
                <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff' }}>
                  {b.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Google Authentication Button */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '2rem' }}>
          <GoogleLogin
            onSuccess={onLoginSuccess}
            onError={onLoginError}
            useOneTap
            theme="outline"
            shape="square"
            width="280"
          />
        </div>

        {/* Skip button */}
        <button
          onClick={onSkip}
          style={{
            border: 'none',
            background: 'none',
            color: '#888888',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            cursor: 'pointer',
            letterSpacing: '0.05em'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#888888'}
        >
          Skip & Lose Progress
        </button>
      </motion.div>
    </div>
  );
}

export default SignupPrompt;
