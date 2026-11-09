import React, { useState } from 'react';
import { ArrowRight, Check, Clock3, Languages, Pencil, UserRound } from 'lucide-react';
import { BackButton, GameButton, Metric, PageHeading, PlayerAvatar } from '../game/GameUI';
import RatingBadge from './RatingBadge';
import AvatarSelector from './AvatarSelector';
import GameSelect from '../game/GameSelect';
import '../../styles/battle-scenes.css';

const LANGUAGES = [['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['es-ES', 'Español (Spain)'], ['es-MX', 'Español (Mexico)'], ['fr-FR', 'Français'], ['de-DE', 'Deutsch'], ['hi-IN', 'हिन्दी'], ['it-IT', 'Italiano'], ['ja-JP', '日本語'], ['pt-BR', 'Português'], ['zh-CN', '中文'], ['ar-SA', 'العربية']];
const LANGUAGE_OPTIONS = LANGUAGES.map(([value, label]) => ({ value, label }));

export function BattleLobby({ user, onFindMatch, onBack, onViewProfile, selectedLanguage, onChangeLanguage }) {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('speakspin-player-name') || user?.name || 'Guest Speaker');
  const [avatar, setAvatar] = useState(() => localStorage.getItem('speakspin-player-avatar') || user?.avatar || 'voice');
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
  return <div className="battle-scene battle-prep">
    <PageHeading title="Make your next move." description="One topic. Two voices. A minute to make it yours." action={<BackButton onClick={onBack}>Lobby</BackButton>} />
    <div className="battle-prep-layout">
      <section className="battle-entry">
        <img className="battle-entry-art" src="/images/game/battle-duel.webp" alt="" width="960" height="640" />
        <div className="battle-entry-copy"><h2>A little rivalry.<br />A stronger voice.</h2><p>A surprise topic. Your own point of view. Step into a speaking battle and see how your words compare.</p></div>
        <div className="battle-entry-controls">
          <div className="battle-meta"><span><UserRound size={16} />1 vs 1</span><span><Clock3 size={16} />60 seconds</span><span><Languages size={16} />Same language</span></div>
          <div className="field-label"><label htmlFor="battle-language">Speaking language</label><GameSelect id="battle-language" label="Speaking language" value={selectedLanguage || 'en-US'} onValueChange={onChangeLanguage} options={LANGUAGE_OPTIONS} /></div>
          <GameButton onClick={() => onFindMatch({ playerName, avatar, rating, language: selectedLanguage || 'en-US' })}>Find a match<ArrowRight size={18} /></GameButton>
          <p className="battle-small-copy">Your microphone check comes before the clock.</p>
        </div>
      </section>
      <section className="battle-player-summary" aria-label="Your player profile">
        <div className="battle-loadout-identity"><PlayerAvatar avatar={avatar} name={playerName} size="large" /><div>{editingName ? <form className="player-name-form" onSubmit={saveName}><label className="field-label" htmlFor="battle-player-name">Player name</label><input id="battle-player-name" name="playerName" className="game-input" maxLength={15} defaultValue={playerName} autoFocus required /><GameButton variant="secondary" type="submit"><Check size={16} />Save</GameButton></form> : <h2>{playerName}</h2>}<RatingBadge rating={rating} /></div></div>
        <div className="battle-loadout-actions"><GameButton variant="ghost" onClick={() => setEditingName(!editingName)}><Pencil size={15} />Edit name</GameButton><GameButton variant="ghost" aria-expanded={editingAvatar} onClick={() => setEditingAvatar(!editingAvatar)}><UserRound size={15} />Change crest</GameButton></div>
        {editingAvatar && <AvatarSelector selectedAvatar={avatar} onSelect={value => { setAvatar(value); localStorage.setItem('speakspin-player-avatar', value); setEditingAvatar(false); }} />}
        <div className="battle-stats"><Metric value={`${wins}–${losses}`} label="Wins / losses" /><Metric value={streak} label="Win streak" /></div>
        <GameButton variant="secondary" onClick={onViewProfile}>Your player record<ArrowRight size={16} /></GameButton>
      </section>
    </div>
  </div>;
}
export default BattleLobby;
