import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TOPIC_CATEGORIES = {
  general: [
    "The best advice I ever received",
    "How failure can lead to success",
    "The importance of continuous learning",
    "My childhood memories and their impact",
    "How public speaking changes your confidence",
    "The role of art in daily life",
    "A habit that changed my life"
  ],
  technology: [
    "Is artificial intelligence a threat or helper?",
    "How social media affects human relationships",
    "The future of remote work and digital nomadism",
    "Should coding be taught as a core school subject?",
    "How virtual reality is transforming education",
    "The impact of smartphones on our attention span",
    "Will automation replace human creativity?"
  ],
  philosophy: [
    "What does it mean to live a good life?",
    "Is happiness a choice or a state of mind?",
    "The concept of time: illusion or reality?",
    "Does absolute freedom exist?",
    "How we find meaning in a chaotic world",
    "The value of silence in a noisy society"
  ]
};

export function TimerSelector({ selectedDuration, onChangeDuration, onNext, onBack, onStartWithCustomTopic }) {
  const [topicMode, setTopicMode] = useState('wheel'); // 'wheel' | 'custom'
  const [selectedTopic, setSelectedTopic] = useState('');

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

      <div className="timer-selector-grid" style={{ marginBottom: '2rem' }}>
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

      <div className="setup-instruction">Select Topic Selection Mode</div>

      {/* Mode Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', border: '2px solid #ffffff', backgroundColor: '#0a0a1a', padding: '0.2rem' }}>
        <button
          onClick={() => setTopicMode('wheel')}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: 'none',
            background: topicMode === 'wheel' ? '#ffffff' : 'transparent',
            color: topicMode === 'wheel' ? '#000000' : '#ffffff',
            fontWeight: 900,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }}
        >
          🎡 Random Wheel
        </button>
        <button
          onClick={() => setTopicMode('custom')}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: 'none',
            background: topicMode === 'custom' ? '#ffffff' : 'transparent',
            color: topicMode === 'custom' ? '#000000' : '#ffffff',
            fontWeight: 900,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }}
        >
          📂 Select Topic
        </button>
      </div>

      {topicMode === 'wheel' ? (
        <motion.button
          className="btn btn-primary"
          style={{ width: '100%', padding: '1.25rem' }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
          Spin the Wheel!
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: '#000000',
              border: '2px solid #ffffff',
              color: '#ffffff',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              borderRadius: '0px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">-- SELECT TOPIC FROM LIST --</option>
            <optgroup label="🌐 GENERAL TOPICS">
              {TOPIC_CATEGORIES.general.map(t => <option key={t} value={t}>{t}</option>)}
            </optgroup>
            <optgroup label="💻 TECHNOLOGY & DIGITAL FUTURE">
              {TOPIC_CATEGORIES.technology.map(t => <option key={t} value={t}>{t}</option>)}
            </optgroup>
            <optgroup label="🧠 PHILOSOPHY & MINDFULNESS">
              {TOPIC_CATEGORIES.philosophy.map(t => <option key={t} value={t}>{t}</option>)}
            </optgroup>
          </select>

          <button
            onClick={() => selectedTopic && onStartWithCustomTopic(selectedTopic)}
            className="btn btn-primary"
            disabled={!selectedTopic}
            style={{
              width: '100%',
              padding: '1.25rem',
              opacity: selectedTopic ? 1 : 0.5,
              cursor: selectedTopic ? 'pointer' : 'not-allowed'
            }}
          >
            <span className="material-symbols-outlined text-sm">mic</span>
            Start Speaking!
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default TimerSelector;
