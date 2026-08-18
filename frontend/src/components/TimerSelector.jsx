import React from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  "General",
  "Personal Finance",
  "Entrepreneurship",
  "Startups",
  "Tech / AI",
  "Fitness",
  "Nutrition",
  "Productivity",
  "History",
  "Literature",
  "Philosophy"
];

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Español (Spain)' },
  { code: 'es-MX', name: 'Español (Mexico)' },
  { code: 'fr-FR', name: 'Français (France)' },
  { code: 'de-DE', name: 'Deutsch (Germany)' },
  { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
  { code: 'it-IT', name: 'Italiano (Italy)' },
  { code: 'ja-JP', name: '日本語 (Japanese)' },
  { code: 'pt-BR', name: 'Português (Brazil)' },
  { code: 'zh-CN', name: '中文 (Simplified Chinese)' },
  { code: 'ar-SA', name: 'العربية (Arabic)' }
];

export function TimerSelector({ 
  selectedDuration, 
  onChangeDuration, 
  onNext, 
  onBack, 
  selectedCategory,
  onChangeCategory,
  selectedLanguage,
  onChangeLanguage
}) {
  const options = [
    { value: 30, icon: 'bolt', label: '30s', desc: 'Quick' },
    { value: 60, icon: 'my_location', label: '1 min', desc: 'Standard' },
    { value: 120, icon: 'local_fire_department', label: '2 min', desc: 'Challenge' },
    { value: 300, icon: 'emoji_events', label: '5 min', desc: 'Pro Mode' },
  ];

  return (
    <motion.div
      className="setup-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '500px', width: '100%', margin: '0 auto' }}
    >
      <div className="setup-header">
        <button className="btn-back-ghost" onClick={onBack}>
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back
        </button>
        <h2 className="setup-title" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined text-2xl">settings</span> Set Your Challenge
        </h2>
      </div>

      <div className="setup-instruction">Select Speech Duration</div>

      <div className="timer-selector-grid" style={{ marginBottom: '1.5rem' }}>
        {options.map((opt) => {
          const isSelected = selectedDuration === opt.value;
          return (
            <motion.div
              key={opt.value}
              className={`timer-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onChangeDuration(opt.value)}
              whileHover={{ y: isSelected ? 0 : -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div style={{ marginBottom: '0.75rem' }}>
                <span className="material-symbols-outlined text-3xl">{opt.icon}</span>
              </div>
              <div className="timer-card-val">{opt.label}</div>
              <div className="timer-card-label">{opt.desc}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="setup-instruction">Select Theme Category</div>

      {/* Category Dropdown Selector */}
      <select
        value={selectedCategory}
        onChange={(e) => onChangeCategory(e.target.value)}
        style={{
          width: '100%',
          padding: '0.85rem',
          backgroundColor: 'var(--bg-card-alt)',
          border: 'var(--border-glow)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          borderRadius: 'var(--radius-sm)',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        {CATEGORIES.map(cat => (
          <option key={cat} value={cat}>{cat.toUpperCase()}</option>
        ))}
      </select>

      <div className="setup-instruction">Select Speaking Language</div>

      {/* Language Dropdown Selector */}
      <select
        value={selectedLanguage}
        onChange={(e) => onChangeLanguage(e.target.value)}
        style={{
          width: '100%',
          padding: '0.85rem',
          backgroundColor: 'var(--bg-card-alt)',
          border: 'var(--border-glow)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '0.9rem',
          marginBottom: '2rem',
          borderRadius: 'var(--radius-sm)',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        {SUPPORTED_LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.name}</option>
        ))}
      </select>

      <motion.button
        className="btn btn-primary"
        style={{ width: '100%', padding: '1.25rem' }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
      >
        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
        Spin the "{selectedCategory}" Wheel!
      </motion.button>
    </motion.div>
  );
}

export default TimerSelector;
