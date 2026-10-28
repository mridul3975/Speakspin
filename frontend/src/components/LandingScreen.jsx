import React from 'react';
import { ArrowRight, AudioLines, CircleHelp, Clock3, Mic, RotateCw, Swords, Target, Trophy } from 'lucide-react';
import { GameButton, Metric, PlayerAvatar } from './game/GameUI';
import RatingBadge from './multiplayer/RatingBadge';

const LANGUAGES = [
  ['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['es-ES', 'Español (Spain)'],
  ['es-MX', 'Español (Mexico)'], ['fr-FR', 'Français'], ['de-DE', 'Deutsch'],
  ['hi-IN', 'हिन्दी (Hindi)'], ['it-IT', 'Italiano'], ['ja-JP', '日本語'],
  ['pt-BR', 'Português (Brazil)'], ['zh-CN', '中文'], ['ar-SA', 'العربية'],
];

export function LandingScreen({ onStart, onStartBattle, onViewProgress, onViewProfile, selectedLanguage, setSelectedLanguage, user }) {
  const rating = Number(localStorage.getItem('speakspin-rating')) || 1000;
  const wins = Number(localStorage.getItem('speakspin-wins')) || 0;
  const losses = Number(localStorage.getItem('speakspin-losses')) || 0;
  const draws = Number(localStorage.getItem('speakspin-draws')) || 0;
  const rounds = wins + losses + draws;
  const playerName = localStorage.getItem('speakspin-player-name') || user?.name || 'Guest speaker';
  return (
    <div className="lobby-layout">
      <aside className="lobby-player-rail" aria-label="Your player profile">
        <div className="lobby-player-identity">
          <PlayerAvatar avatar={localStorage.getItem('speakspin-player-avatar') || user?.avatar} name={playerName} size="large" />
          <h2>{playerName}</h2>
          <p>{user?.isGuest ? 'Guest player' : 'Ready for your next round'}</p>
          <RatingBadge rating={rating} />
        </div>
        <div className="lobby-record"><Metric value={rounds} label="Battles played" /><Metric value={wins} label="Wins" /></div>
        <GameButton variant="secondary" onClick={onViewProfile}><Trophy size={17} />Player profile<ArrowRight size={16} /></GameButton>
        <div className="lobby-practice-note"><AudioLines size={22} /><p>A little practice.<br /><strong>A stronger voice.</strong></p><button className="text-link" onClick={onViewProgress}>View your progress <ArrowRight size={14} /></button></div>
        <p className="lobby-storage-note">{user?.isGuest ? 'Battle stats stay in this browser. Sign in to save your solo practice history.' : 'Solo practice history is saved to your account. Battle stats stay in this browser.'}</p>
      </aside>
      <div className="lobby-main">
        <section className="lobby-arena" aria-labelledby="arena-title">
          <img className="arena-key-art" src="/images/voice-arena.png" alt="" width="1536" height="1024" fetchPriority="high" />
          <div className="arena-copy">
            <h1 id="arena-title">The mic<br />is <em>yours.</em></h1>
            <p>One topic. Two speakers.<br />Make your words count.</p>
            <GameButton onClick={onStartBattle} className="arena-play"><Swords size={21} />Play a 1v1<ArrowRight size={19} /></GameButton>
            <label className="arena-language"><span>Speaking language</span><select className="game-select" value={selectedLanguage} onChange={event => setSelectedLanguage(event.target.value)}>{LANGUAGES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label>
          </div>
          <div className="arena-format"><span><Mic size={14} />Live speech battle</span><span><Target size={14} />Same topic. Your take.</span></div>
        </section>
        <section className="training-entry" aria-labelledby="training-title">
          <div className="training-symbol"><Mic size={26} /></div>
          <div><h2 id="training-title">Warm up your voice.</h2><p>Spin a topic. Set your pace. Find your flow in solo training.</p></div>
          <GameButton variant="secondary" onClick={onStart}>Train solo<ArrowRight size={17} /></GameButton>
        </section>
        <section className="lobby-how-to" aria-labelledby="how-to-title">
          <h2 id="how-to-title"><CircleHelp size={17} />Your next round, in three moves</h2>
          <ol>
            <li><RotateCw size={19} /><span><strong>Get a topic</strong>A fresh prompt for both players.</span></li>
            <li><Clock3 size={19} /><span><strong>Take the mic</strong>Make your point before time runs out.</span></li>
            <li><Trophy size={19} /><span><strong>See how you did</strong>Compare scores. Learn. Go again.</span></li>
          </ol>
        </section>
      </div>
    </div>
  );
}
export default LandingScreen;
