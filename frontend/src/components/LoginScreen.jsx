import React from 'react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

export function LoginScreen({ onLoginSuccess, onLoginError }) {
  const handleGuestLogin = () => {
    onLoginSuccess({ credential: 'mock-google-token' });
  };

  return (
    <div className="landing-container login-screen-wrapper">
      <motion.div
        className="landing-logo"
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      >
        <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>track_changes</span>
      </motion.div>

      <h1 className="landing-title">
        Speak<span className="text-teal">Spin</span>
      </h1>
      
      <p className="landing-tagline">
        AI-Powered Public Speaking Coach
      </p>

      <motion.div
        className="landing-card login-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase' }}>Start Your Journey</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.5' }}>
          Sign in to unlock personalized topics, record speech logs, and track your metrics over time.
        </p>

        {/* Google Authentication Button - Styled square for brutalist look */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '1.25rem' }}>
          <GoogleLogin
            onSuccess={onLoginSuccess}
            onError={onLoginError}
            useOneTap
            theme="outline"
            shape="square"
            width="250"
          />
        </div>

        {/* Divider */}
        <div className="login-divider">
          <span>or</span>
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleGuestLogin}
          style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem' }}
        >
          <span className="material-symbols-outlined text-sm">offline_bolt</span>
          Test as Guest (Offline)
        </button>
      </motion.div>
    </div>
  );
}

export default LoginScreen;
