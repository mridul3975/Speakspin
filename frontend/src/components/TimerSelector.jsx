import React from 'react';
import { ArrowRight, Clock3, Shuffle } from 'lucide-react';
import { BackButton, GameButton, PageHeading } from './game/GameUI';

const CATEGORIES = ['General', 'Personal Finance', 'Entrepreneurship', 'Startups', 'Tech / AI', 'Fitness', 'Nutrition', 'Productivity', 'History', 'Literature', 'Philosophy'];
const LANGUAGES = [
  ['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['es-ES', 'Español (Spain)'], ['es-MX', 'Español (Mexico)'],
  ['fr-FR', 'Français'], ['de-DE', 'Deutsch'], ['hi-IN', 'हिन्दी (Hindi)'], ['it-IT', 'Italiano'],
  ['ja-JP', '日本語 (Japanese)'], ['pt-BR', 'Português (Brazil)'], ['zh-CN', '中文 (Chinese)'], ['ar-SA', 'العربية (Arabic)'],
];
const DURATIONS = [
  { value: 30, label: '30', unit: 'sec', caption: 'Quick warm-up' },
  { value: 60, label: '1', unit: 'min', caption: 'The classic' },
  { value: 120, label: '2', unit: 'min', caption: 'Room to build' },
  { value: 300, label: '5', unit: 'min', caption: 'Go the distance' },
];

export function TimerSelector({ selectedDuration, onChangeDuration, onNext, onBack, selectedCategory, onChangeCategory, selectedLanguage, onChangeLanguage }) {
  return (
    <section className="screen-stack solo-setup">
      <BackButton onClick={onBack}>Back to lobby</BackButton>
      <PageHeading title="Set your challenge." description="Pick your pace. The wheel takes care of the topic." />
      <div className="game-panel setup-fields">
        <fieldset>
          <legend className="field-label"><Clock3 size={17} /> Round duration</legend>
          <div className="duration-options">
            {DURATIONS.map(option => (
              <label key={option.value} className={`duration-option${selectedDuration === option.value ? ' is-selected' : ''}`}>
                <input type="radio" name="duration" value={option.value} checked={selectedDuration === option.value} onChange={() => onChangeDuration(option.value)} />
                <span className="duration-value">{option.label}<small>{option.unit}</small></span>
                <span className="duration-caption">{option.caption}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="setup-selects">
          <label className="field-label" htmlFor="solo-category">Topic category
            <select id="solo-category" className="game-select" value={selectedCategory} onChange={event => onChangeCategory(event.target.value)}>
              {CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="field-label" htmlFor="solo-language">Speaking language
            <select id="solo-language" className="game-select" value={selectedLanguage} onChange={event => onChangeLanguage(event.target.value)}>
              {LANGUAGES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </label>
        </div>
        <div className="round-summary"><Shuffle size={20} /><p>A random <strong>{selectedCategory.toLowerCase()}</strong> topic. <strong>{selectedDuration} seconds</strong> to make it yours. You can review your transcript before scoring.</p></div>
        <GameButton onClick={onNext}>Spin for a topic <ArrowRight size={18} /></GameButton>
      </div>
    </section>
  );
}

export default TimerSelector;
