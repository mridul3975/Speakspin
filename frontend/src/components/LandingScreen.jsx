import React from 'react';
import { ArrowRight, ArrowUpRight, AudioLines, Clock3, Globe2, Mic, Swords } from 'lucide-react';
import { GameButton } from './game/GameUI';
import GameSelect from './game/GameSelect';

const LANGUAGES = [
  ['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['es-ES', 'Español (Spain)'],
  ['es-MX', 'Español (Mexico)'], ['fr-FR', 'Français'], ['de-DE', 'Deutsch'],
  ['hi-IN', 'हिन्दी (Hindi)'], ['it-IT', 'Italiano'], ['ja-JP', '日本語'],
  ['pt-BR', 'Português (Brazil)'], ['zh-CN', '中文'], ['ar-SA', 'العربية'],
];
const LANGUAGE_OPTIONS = LANGUAGES.map(([value, label]) => ({ value, label }));

export function LandingScreen({ onStart, onStartBattle, selectedLanguage, setSelectedLanguage }) {
  return <div className="game-lobby">
    <div className="lobby-heading"><h1>Let's play.</h1><span><AudioLines size={15} /> Every voice has a game.</span></div>
    <div className="mode-grid">
      <section className="mode-tile mode-tile--battle" aria-labelledby="battle-mode-title">
        <img className="mode-art mode-art--battle" src="/images/game/battle-duel.webp" alt="" width="960" height="640" />
        <div className="mode-tile-copy"><h2 id="battle-mode-title">1v1<br />Battle</h2><p>One topic. Two speakers.<br />Your words make the difference.</p></div>
        <div className="mode-tile-bottom"><GameButton onClick={onStartBattle}><Swords size={18} /> Play a 1v1 <ArrowRight size={17} /></GameButton><span className="mode-format"><Clock3 size={13} />60-second rounds</span></div>
      </section>
      <section className="mode-tile mode-tile--solo" aria-labelledby="solo-mode-title">
        <img className="mode-art mode-art--solo" src="/images/game/solo-wheel.webp" alt="" width="640" height="700" />
        <div className="solo-tile-copy"><h2 id="solo-mode-title">Solo practice</h2><p>Spin a topic.<br />Find your flow.</p></div>
        <GameButton variant="secondary" onClick={onStart} className="solo-tile-action">Play solo <ArrowUpRight size={18} /></GameButton>
      </section>
    </div>
    <div className="lobby-utilities"><div className="lobby-language"><Globe2 size={15} /><label htmlFor="lobby-language">Speaking language</label><GameSelect id="lobby-language" label="Speaking language" value={selectedLanguage} onValueChange={setSelectedLanguage} options={LANGUAGE_OPTIONS} /></div><span><Mic size={14} />A topic. A timer. Your take.</span></div>
  </div>;
}
export default LandingScreen;
