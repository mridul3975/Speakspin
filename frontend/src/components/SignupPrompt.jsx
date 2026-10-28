import React from 'react';
import { BookmarkCheck, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { GameButton } from './game/GameUI';

export function SignupPrompt({ onLoginSuccess, onLoginError, onSkip }) {
  return <section className="game-panel account-screen">
    <span className="account-mark" aria-hidden="true"><BookmarkCheck size={35} /></span>
    <h1>Keep your practice.</h1>
    <p>Sign in to save future solo practice sessions and revisit your feedback from your account.</p>
    <div className="account-signin"><GoogleLogin onSuccess={onLoginSuccess} onError={onLoginError} theme="filled_black" shape="rectangular" width="280" /></div>
    <p className="account-note">Your guest battle record stays in this browser. Signing in does not move it to another device.</p>
    <GameButton variant="ghost" onClick={onSkip}>Continue as guest <ArrowRight size={18} /></GameButton>
  </section>;
}

export default SignupPrompt;
