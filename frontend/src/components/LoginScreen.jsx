import React from 'react';
import { AudioLines, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { GameButton } from './game/GameUI';

export function LoginScreen({ onLoginSuccess, onLoginError, onContinueGuest }) {
  return <section className="game-panel account-screen">
    <span className="account-mark" aria-hidden="true"><AudioLines size={35} /></span>
    <h1>Find your voice.</h1>
    <p>Take on a topic, speak against the clock, and build your confidence one round at a time.</p>
    <div className="account-signin"><GoogleLogin onSuccess={onLoginSuccess} onError={onLoginError} theme="filled_black" shape="rectangular" width="280" /></div>
    <p className="account-note">Sign in to save solo practice feedback to your account.</p>
    <GameButton variant="secondary" onClick={onContinueGuest}>Play as a guest <ArrowRight size={18} /></GameButton>
  </section>;
}

export default LoginScreen;
