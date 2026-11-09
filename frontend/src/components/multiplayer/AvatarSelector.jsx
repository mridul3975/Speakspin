import React from 'react';
import { PlayerAvatar } from '../game/GameUI';

const AVATARS = [['🦁', 'Microphone'], ['🐯', 'Shield'], ['🦊', 'Lightning'], ['🦅', 'Duel'], ['⚡', 'Trophy'], ['🎯', 'Voice'], ['🎭', 'Spark']];
export function AvatarSelector({ selectedAvatar, onSelect }) {
  return <div className="battle-crest-options" role="group" aria-label="Choose your player crest">{AVATARS.map(([avatar, label]) => <button key={avatar} type="button" aria-label={`${label} crest`} aria-pressed={selectedAvatar === avatar} className={`battle-crest-choice${selectedAvatar === avatar ? ' is-selected' : ''}`} onClick={() => onSelect(avatar)}><PlayerAvatar avatar={avatar} size="small" /><span>{label}</span></button>)}</div>;
}
export default AvatarSelector;
