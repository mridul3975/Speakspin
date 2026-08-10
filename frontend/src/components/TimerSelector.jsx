import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export function TimerSelector({ selectedDuration, onChangeDuration, onNext, onBack }) {
  const options = [
    { value: 30, emoji: '⚡', label: '30s', desc: 'Quick' },
    { value: 60, emoji: '🎯', label: '1 min', desc: 'Standard' },
    { value: 120, emoji: '🔥', label: '2 min', desc: 'Challenge' },
    { value: 300, emoji: '🏆', label: '5 min', desc: 'Pro Mode' },
  ];

  return (
    <motion.div
      className="setup-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="setup-header">
        <button className="btn-back-ghost" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <h2 className="setup-title">⚙️ Set Your Challenge</h2>
      </div>

      <div className="duration-grid">
        {options.map((opt) => {
          const isSelected = selectedDuration === opt.value;
          return (
            <motion.div
              key={opt.value}
              className={`duration-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onChangeDuration(opt.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={{
                borderColor: isSelected ? '#4ECDC4' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: isSelected 
                  ? '0 0 15px rgba(78, 205, 196, 0.3)' 
                  : '0 4px 10px rgba(0, 0, 0, 0.2)'
              }}
              transition={{ duration: 0.2 }}
            >
              <span className="duration-emoji">{opt.emoji}</span>
              <span className="duration-label">{opt.label}</span>
              <span className="duration-desc">{opt.desc}</span>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        className="btn btn-primary btn-spin-trigger"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
      >
        🎰 Spin the Wheel!
      </motion.button>
    </motion.div>
  );
}

export default TimerSelector;
