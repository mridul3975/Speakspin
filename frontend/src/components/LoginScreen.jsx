import React from 'react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[400px]"
      >
        <Card className="bg-black border-4 border-white rounded-none shadow-[6px_6px_0px_0px_#ffffff] text-white p-6">
          <CardContent className="p-0 text-center">
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

            <Button
              variant="outline"
              onClick={handleGuestLogin}
              className="w-full bg-transparent border-2 border-[#333333] text-[#888888] rounded-none h-12 uppercase tracking-widest font-black hover:bg-[#111111] hover:text-white"
            >
              <span className="material-symbols-outlined text-sm mr-2">offline_bolt</span>
              Test as Guest (Offline)
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default LoginScreen;
