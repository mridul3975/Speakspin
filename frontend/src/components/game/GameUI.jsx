import React from 'react';
import { ArrowLeft, AudioLines, LoaderCircle, Mic, Shield, Sparkles, Swords, Trophy, Zap } from 'lucide-react';

export function GameButton({ children, variant = 'primary', className = '', ...props }) {
  return <button className={`game-button game-button--${variant} ${className}`} {...props}>{children}</button>;
}

export function BackButton({ onClick, children = 'Back' }) {
  return <GameButton variant="ghost" onClick={onClick}><ArrowLeft size={17} />{children}</GameButton>;
}

export function PageHeading({ title, description, action }) {
  return <div className="page-heading"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}

const avatarIcons = [Mic, AudioLines, Zap, Shield, Swords, Trophy, Sparkles];
export function PlayerAvatar({ avatar, name = 'Player', size = 'medium', rival = false }) {
  const value = String(avatar || name);
  const index = [...value].reduce((sum, character) => sum + character.codePointAt(0), 0) % avatarIcons.length;
  const Icon = avatarIcons[index];
  return <span aria-hidden="true" className={`player-avatar player-avatar--${size}${rival ? ' player-avatar--rival' : ''}`}><Icon strokeWidth={1.7} /></span>;
}

export function StatusNotice({ children, tone = 'info', action }) {
  return <div className={`status-notice status-notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}><span>{children}</span>{action}</div>;
}

export function LoadingState({ title = 'Getting ready', description = 'One moment…', children }) {
  return <section className="game-panel loading-state" aria-live="polite"><LoaderCircle className="loading-spinner" size={36} /><h1>{title}</h1><p>{description}</p>{children}</section>;
}

export function Metric({ value, label }) {
  return <div className="game-metric"><strong>{value}</strong><span>{label}</span></div>;
}
