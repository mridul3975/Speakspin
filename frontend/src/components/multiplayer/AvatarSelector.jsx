import React from 'react';
import { PlayerAvatar } from '../game/GameUI';
const AVATARS = [['🦁', 'Microphone'], ['🐯', 'Shield'], ['🦊', 'Lightning'], ['🦅', 'Duel'], ['⚡', 'Trophy'], ['🎯', 'Voice'], ['🎭', 'Spark']];
export function AvatarSelector({
  selectedAvatar,
  onSelect
}) {
  return <div className="avatar-options" role="group" aria-label="Choose your player crest">{AVATARS.map(([avatar, label]) => <button key={avatar} type="button" aria-label={`${label} crest`} aria-pressed={selectedAvatar === avatar} className={`avatar-choice${selectedAvatar === avatar ? ' avatar-choice--selected' : ''}`} onClick={() => onSelect(avatar)}><PlayerAvatar avatar={avatar} size="small" /><span>{label}</span></button>)}</div>;
}
export default AvatarSelector;
