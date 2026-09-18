import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';

const TIPS = [
  "💡 Start with a strong opening sentence to hook the judge.",
  "💡 Speak slower than you think you need to. Pacing is key.",
  "💡 Use deliberate pauses for emphasis rather than filling with sounds.",
  "💡 Structure: State your Point → Give a Reason → Illustrate with an Example.",
  "💡 Control your breathing to reduce perceived anxiety levels."
];



export function Matchmaking({ isConnected, rating, onCancel, onFightBot }) {
  const [seconds, setSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Queue stopwatch
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
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

  return (
    <div className="setup-container" style={{ margin: '2rem auto 0', maxWidth: '500px', position: 'relative', textAlign: 'center', overflow: 'hidden' }}>
      
      {/* Search Header */}
      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.4rem' }}>
        🔍 FINDING OPPONENT
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Queue Time: {formatTimer(seconds)}
      </p>

      {!isConnected && seconds > 2 && (
        <div style={{ border: '2px solid #ff3333', backgroundColor: 'rgba(255, 51, 51, 0.1)', color: '#ff5555', padding: '0.75rem', marginTop: '1rem', fontWeight: 800, fontSize: '0.8rem' }}>
          ⚠️ Backend server unreachable at http://localhost:3001. Please ensure <code>node server.js</code> is running in <code>backend/</code>.
        </div>
      )}

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
      <Button variant="outline" className="bg-transparent hover:bg-[#111111] text-[#888888] font-black uppercase tracking-widest rounded-none border-2 border-[#333333] px-6 h-12" onClick={onCancel} style={{ width: '100%' }}>
        <span className="material-symbols-outlined text-sm">close</span> CANCEL SEARCH
      </Button>



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
