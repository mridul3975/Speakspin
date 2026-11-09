import React from 'react';
import { ArrowRight, Check, Clock3, Mic, Shuffle } from 'lucide-react';
import { BackButton, GameButton } from './game/GameUI';
import GameSelect from './game/GameSelect';
import '../styles/solo-scenes.css';

const CATEGORIES = ['General', 'Personal Finance', 'Entrepreneurship', 'Startups', 'Tech / AI', 'Fitness', 'Nutrition', 'Productivity', 'History', 'Literature', 'Philosophy'];
const LANGUAGES = [
  ['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['es-ES', 'Español (Spain)'], ['es-MX', 'Español (Mexico)'],
  ['fr-FR', 'Français'], ['de-DE', 'Deutsch'], ['hi-IN', 'हिन्दी (Hindi)'], ['it-IT', 'Italiano'],
  ['ja-JP', '日本語 (Japanese)'], ['pt-BR', 'Português (Brazil)'], ['zh-CN', '中文 (Chinese)'], ['ar-SA', 'العربية (Arabic)'],
];
const CATEGORY_OPTIONS = CATEGORIES.map(value => ({ value, label: value }));
const LANGUAGE_OPTIONS = LANGUAGES.map(([value, label]) => ({ value, label }));
const DURATIONS = [
  { value: 30, label: '30', unit: 'sec', caption: 'Quick warm-up' },
  { value: 60, label: '1', unit: 'min', caption: 'The classic' },
  { value: 120, label: '2', unit: 'min', caption: 'Room to build' },
  { value: 300, label: '5', unit: 'min', caption: 'Go the distance' },
];

export function TimerSelector({ selectedDuration, onChangeDuration, onNext, onBack, selectedCategory, onChangeCategory, selectedLanguage, onChangeLanguage }) {
  return (
    <section className="screen-stack solo-setup solo-scene">
      <BackButton onClick={onBack}>Back to lobby</BackButton>
      <div className="solo-prep-layout">
        <div className="solo-prep-intro">
          <h1>Your next<br /><span>great take.</span></h1>
          <p>A topic you didn’t see coming.<br />A little time to make it yours.</p>
          <img className="solo-prep-art" src="/images/game/solo-wheel.webp" alt="" width="640" height="700" />
          <div className="solo-prep-format"><Mic size={17} /><span>Solo practice · Your pace</span></div>
        </div>
        <div className="setup-fields solo-prep-controls">
        <div className="solo-prep-title"><h2>Choose your round</h2><p>The wheel takes care of the topic.</p></div>
        <fieldset>
          <legend className="field-label"><Clock3 size={17} /> Round duration</legend>
          <div className="duration-options">
            {DURATIONS.map(option => (
              <label key={option.value} className={`duration-option${selectedDuration === option.value ? ' is-selected' : ''}`}>
                <input type="radio" name="duration" value={option.value} checked={selectedDuration === option.value} onChange={() => onChangeDuration(option.value)} />
                <Check className="duration-check" size={14} aria-hidden="true" />
                <span className="duration-value">{option.label}<small>{option.unit}</small></span>
                <span className="duration-caption">{option.caption}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="setup-selects">
          <div className="field-label"><label htmlFor="solo-category">Topic category</label><GameSelect id="solo-category" label="Topic category" value={selectedCategory} onValueChange={onChangeCategory} options={CATEGORY_OPTIONS} /></div>
          <div className="field-label"><label htmlFor="solo-language">Speaking language</label><GameSelect id="solo-language" label="Speaking language" value={selectedLanguage} onValueChange={onChangeLanguage} options={LANGUAGE_OPTIONS} /></div>
        </div>
        <div className="round-summary"><Shuffle size={20} /><p><strong>{selectedDuration} seconds.</strong> One random {selectedCategory.toLowerCase()} topic. Review your transcript before scoring.</p></div>
        <GameButton className="solo-prep-play" onClick={onNext}>Spin for a topic <ArrowRight size={18} /></GameButton>
        <p className="solo-prep-footnote">Your microphone check comes after the spin.</p>
        </div>
      </div>
    </section>
  );
}

export default TimerSelector;
