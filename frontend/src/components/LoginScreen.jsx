import React from 'react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

export function LoginScreen({ onLoginSuccess, onLoginError }) {
  const handleGuestLogin = () => {
    // Triggers mock login flow
    onLoginSuccess({ credential: 'mock-google-token' });
  };

  return (
    <div className="landing-container login-screen-wrapper">
      <motion.div
        className="landing-logo"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      >
        🎯
      </motion.div>

      <h1 className="landing-title">
        Speak<span className="text-teal">Spin</span>
      </h1>
      
      <p className="landing-tagline">
        AI-Powered Public Speaking Coach
      </p>

      <motion.div
        className="landing-card login-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ maxWidth: '400px', width: '100%', margin: '0 auto 1.5rem', padding: '2.5rem 2rem' }}
      >
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>Start Your Journey</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.5' }}>
          Sign in to unlock personalized topics, record speech logs, and track your metrics over time.
        </p>

        {/* Google Authentication Button */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '1.25rem' }}>
          <GoogleLogin
            onSuccess={onLoginSuccess}
            onError={onLoginError}
            useOneTap
            theme="filled_blue"
            shape="pill"
            width="250"
          />
        </div>

        {/* Developer Sandbox / Guest Mode Button */}
        <div className="login-divider" style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', width: '100%' }}>
          <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></span>
          <span style={{ padding: '0 0.75rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>or</span>
          <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></span>
        </div>

        <motion.button
          className="btn btn-secondary"
          onClick={handleGuestLogin}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', color: 'var(--accent-teal)', borderColor: 'rgba(78, 205, 196, 0.2)' }}
        >
          ⚡ Test as Guest (Offline)
        </motion.button>
      </motion.div>
    </div>
  );
}

export default LoginScreen;
