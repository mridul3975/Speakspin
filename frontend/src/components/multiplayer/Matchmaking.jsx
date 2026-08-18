import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TIPS = [
  "💡 Start with a strong opening sentence to hook the judge.",
  "💡 Speak slower than you think you need to. Pacing is key.",
  "💡 Use deliberate pauses for emphasis rather than filling with sounds.",
  "💡 Structure: State your Point → Give a Reason → Illustrate with an Example.",
  "💡 Control your breathing to reduce perceived anxiety levels."
];

const BOT_ROSTER = [
  { id: "bot_beginner", name: "Timid Tim", avatar: "🐢", rating: 700, tier: "Bronze" },
  { id: "bot_intermediate", name: "Average Andy", avatar: "🤖", rating: 950, tier: "Silver" },
  { id: "bot_advanced", name: "SpeakBot 3000", avatar: "⚡", rating: 1150, tier: "Gold" },
  { id: "bot_expert", name: "VoiceAI", avatar: "💎", rating: 1400, tier: "Diamond" },
  { id: "bot_legend", name: "OmegaSpeaker", avatar: "👑", rating: 1700, tier: "Legend" }
];

export function Matchmaking({ rating, onCancel, onFightBot }) {
  const [seconds, setSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [showBotModal, setShowBotModal] = useState(false);

  // Queue stopwatch
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => {
        const nextSec = prev + 1;
        if (nextSec === 30) {
          setShowBotModal(true);
        }
        return nextSec;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Tips rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFightBot = () => {
    // Select bot closest to user rating
    const targetRating = rating + 50;
    const bestBot = BOT_ROSTER.reduce((closest, bot) => {
      const closestDiff = Math.abs(closest.rating - targetRating);
      const botDiff = Math.abs(bot.rating - targetRating);
      return botDiff < closestDiff ? bot : closest;
    });

    onFightBot(bestBot.id);
  };

  return (
    <div className="setup-container" style={{ margin: '2rem auto 0', maxWidth: '500px', position: 'relative', textAlign: 'center', overflow: 'hidden' }}>
      
      {/* Search Header */}
      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.4rem' }}>
        🔍 FINDING OPPONENT
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Queue Time: {formatTimer(seconds)}
      </p>

      {/* Radar Animation (CSS Expanding Circles) */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '3rem 0' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          
          {/* Animated radar rings */}
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '2px solid var(--accent-teal)',
                opacity: 0.8,
                transform: 'scale(1)',
                animation: `radar-pulse 2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite`,
                animationDelay: `${idx * 0.6}s`
              }}
            />
          ))}

          {/* Center search element */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px #ffffff'
            }}
          >
            <span className="material-symbols-outlined text-3xl" style={{ animation: 'spin 4s linear infinite' }}>
              radar
            </span>
          </div>
        </div>
      </div>

      {/* Matching Constraints info */}
      <div style={{ border: '1px dashed #ffffff', padding: '0.75rem', fontSize: '0.8rem', display: 'inline-block', marginBottom: '2rem' }}>
        Your Rating: <strong style={{ color: 'var(--accent-teal)' }}>{rating} ELO</strong>
        {seconds < 10 && ' (Searching within ±200)'}
        {seconds >= 10 && seconds < 20 && ' (Expanding search to ±500)'}
        {seconds >= 20 && ' (Matching with any ELO)'}
      </div>

      {/* Rotating Tips Box */}
      <div style={{ minHeight: '60px', margin: '0 1rem 2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={tipIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}
          >
            {TIPS[tipIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Cancel Search Button */}
      <button className="btn btn-secondary" onClick={onCancel} style={{ width: '100%' }}>
        <span className="material-symbols-outlined text-sm">close</span> CANCEL SEARCH
      </button>

      {/* BOT Match Fallback Modal */}
      <AnimatePresence>
        {showBotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.95)',
              zIndex: 9,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
          >
            <div style={{ border: '4px solid #ffffff', padding: '2rem 1.5rem', backgroundColor: '#000000', boxShadow: '8px 8px 0px 0px #ffffff' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🤖</span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>
                No Opponents Found
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1.5rem' }}>
                We couldn't find any real players in queue right now. Would you like to duel a speech training Bot instead to test your ELO?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button className="btn btn-primary" onClick={handleFightBot} style={{ backgroundColor: 'var(--accent-teal)', borderColor: 'var(--accent-teal)' }}>
                  🤖 DUEL SPEECh BOT
                </button>
                <button className="btn btn-secondary" onClick={() => { setShowBotModal(false); setSeconds(0); }}>
                  KEEP SEARCHING
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline Radar pulse keyframes inject */}
      <style>{`
        @keyframes radar-pulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default Matchmaking;
