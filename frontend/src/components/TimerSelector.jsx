import React from 'react';
import { motion } from 'framer-motion';

export function TimerSelector({ selectedDuration, onChangeDuration, onNext, onBack }) {
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

      <div className="timer-selector-grid">
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

      <motion.button
        className="btn btn-primary"
        style={{ width: '100%', padding: '1.25rem' }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
      >
        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
        Spin the Wheel!
      </motion.button>
    </motion.div>
  );
}

export default TimerSelector;
