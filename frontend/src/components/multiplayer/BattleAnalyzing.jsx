import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const JUDGE_LOGS = [
  "🤖 AI Judge is evaluating vocal projection...",
  "📝 Counting filler word frequency ('um', 'uh', 'like')...",
  "📊 Analyzing vocabulary variety and syntax richness...",
  "⚖️ Weighing speech structure and pacing flow...",
  "🏆 Calculating final competitive ELO score delta..."
];

export function BattleAnalyzing({ opponentSubmitted }) {
  const [logIndex, setLogIndex] = useState(0);
  const [progress, setProgress] = useState(10);

  // Rotating judge logs
  useEffect(() => {
    const logInterval = setInterval(() => {
      setLogIndex(prev => (prev + 1) % JUDGE_LOGS.length);
    }, 3000);
    return () => clearInterval(logInterval);
  }, []);

  // Slowly progress fill simulation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90; // Hold at 90% until socket updates results
        }
        return prev + Math.floor(Math.random() * 8) + 2;
      });
    }, 1000);
    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="setup-container" style={{ margin: '2rem auto 0', maxWidth: '550px', textAlign: 'center', position: 'relative' }}>
      
      {/* Visual Header */}
      <div style={{ margin: '2rem 0' }}>
        <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 1.5rem' }}>
          
          {/* Pulsing AI Brain / Shield logo */}
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              border: '3px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(255,255,255,0.2)'
            }}
          >
            <span className="material-symbols-outlined text-4xl" style={{ color: 'var(--accent-coral)' }}>
              gavel
            </span>
          </motion.div>
        </div>

        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>
          {!opponentSubmitted ? '⏳ WAITING FOR OPPONENT' : '🤖 AI JUDGE DELIBERATING'}
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {!opponentSubmitted 
            ? "Your speech has been submitted! Waiting for them to finish." 
            : "Both speeches submitted. Computing scores..."}
        </p>
      </div>

      {/* Progress Indicator Bar */}
      {opponentSubmitted && (
        <div style={{ margin: '2rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            <span>EVALUATION PROGRESS</span>
            <span>{progress}%</span>
          </div>
          <div style={{ height: '8px', border: '1px solid #ffffff', backgroundColor: '#000000', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', width: `${progress}%`, backgroundColor: 'var(--accent-coral)' }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Rotating Deliberation Commentary */}
      {opponentSubmitted && (
        <div style={{ minHeight: '40px', margin: '1.5rem 1rem 0', borderTop: '1px dashed #333333', paddingTop: '1rem' }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={logIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25 }}
              style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-secondary)', margin: 0 }}
            >
              {JUDGE_LOGS[logIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}

export default BattleAnalyzing;
