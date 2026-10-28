import React, { useState } from 'react';
import { ArrowRight, Check, Clock3, Languages, Pencil, Swords, UserRound } from 'lucide-react';
import { BackButton, GameButton, Metric, PageHeading, PlayerAvatar } from '../game/GameUI';
import RatingBadge from './RatingBadge';
import AvatarSelector from './AvatarSelector';
const LANGUAGES = [['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['es-ES', 'Español (Spain)'], ['es-MX', 'Español (Mexico)'], ['fr-FR', 'Français'], ['de-DE', 'Deutsch'], ['hi-IN', 'हिन्दी'], ['it-IT', 'Italiano'], ['ja-JP', '日本語'], ['pt-BR', 'Português'], ['zh-CN', '中文'], ['ar-SA', 'العربية']];
export function BattleLobby({
  user,
  onFindMatch,
  onBack,
  onViewProfile,
  selectedLanguage,
  onChangeLanguage
}) {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('speakspin-player-name') || user?.name || 'Guest Speaker');
  const [avatar, setAvatar] = useState(() => localStorage.getItem('speakspin-player-avatar') || '🦁');
  const [editingName, setEditingName] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const rating = Number(localStorage.getItem('speakspin-rating') ?? 1000);
  const wins = Number(localStorage.getItem('speakspin-wins') || 0);
  const losses = Number(localStorage.getItem('speakspin-losses') || 0);
  const streak = Number(localStorage.getItem('speakspin-win-streak') || 0);
  const saveName = event => {
    event.preventDefault();
    const cleaned = new FormData(event.currentTarget).get('playerName').trim().slice(0, 15);
    if (cleaned) {
      setPlayerName(cleaned);
      localStorage.setItem('speakspin-player-name', cleaned);
      setEditingName(false);
    }
  };
  return <div className="screen-stack battle-lobby">
    <PageHeading title="Enter the arena" description="One topic. Two voices. Make your minute count." action={<BackButton onClick={onBack}>Home</BackButton>} />
    <div className="battle-lobby-layout">
      <section className="game-panel battle-player-summary" aria-label="Your player profile">
        <div className="player-identity"><PlayerAvatar avatar={avatar} name={playerName} size="large" /><div>{editingName ? <form className="player-name-form" onSubmit={saveName}><label className="field-label" htmlFor="battle-player-name">Player name</label><input id="battle-player-name" name="playerName" className="game-input" maxLength={15} defaultValue={playerName} autoFocus required /><GameButton variant="secondary" type="submit"><Check size={16} />Save</GameButton></form> : <h2>{playerName}</h2>}<RatingBadge rating={rating} /></div></div>
        <div className="game-actions"><GameButton variant="ghost" onClick={() => setEditingName(!editingName)}><Pencil size={15} />Edit name</GameButton><GameButton variant="ghost" aria-expanded={editingAvatar} onClick={() => setEditingAvatar(!editingAvatar)}><UserRound size={15} />Change crest</GameButton></div>
        {editingAvatar && <AvatarSelector selectedAvatar={avatar} onSelect={value => {
          setAvatar(value);
          localStorage.setItem('speakspin-player-avatar', value);
          setEditingAvatar(false);
        }} />}
        <div className="battle-stats"><Metric value={`${wins}–${losses}`} label="Wins / losses" /><Metric value={streak} label="Win streak" /></div>
        <GameButton variant="secondary" onClick={onViewProfile}>View your record<ArrowRight size={16} /></GameButton>
      </section>
      <section className="game-panel battle-entry">
        <Swords size={38} className="battle-entry-icon" aria-hidden="true" /><h2>Your next challenger awaits.</h2>
        <p>Speak on the same surprise topic. Get scored on what you say, then see how your round compares.</p>
        <div className="battle-meta"><span><UserRound size={16} />1 vs 1</span><span><Clock3 size={16} />60 seconds</span><span><Languages size={16} />Same language</span></div>
        <label className="field-label" htmlFor="battle-language">Speaking language</label><select id="battle-language" className="game-select" value={selectedLanguage || 'en-US'} onChange={event => onChangeLanguage?.(event.target.value)}>{LANGUAGES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select>
        <GameButton onClick={() => onFindMatch({
          playerName,
          avatar,
          rating,
          language: selectedLanguage || 'en-US'
        })}>Find a match<ArrowRight size={18} /></GameButton><p className="subtle-copy">You’ll check your microphone before the round begins.</p>
      </section>
    </div>
  </div>;
}
export default BattleLobby;
