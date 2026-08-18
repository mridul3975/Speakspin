import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'EN-US (ENGLISH)' },
  { code: 'en-GB', name: 'EN-GB (ENGLISH)' },
  { code: 'es-ES', name: 'ES-ES (SPANISH)' },
  { code: 'es-MX', name: 'ES-MX (SPANISH)' },
  { code: 'fr-FR', name: 'FR-FR (FRENCH)' },
  { code: 'de-DE', name: 'DE-DE (GERMAN)' },
  { code: 'hi-IN', name: 'HI-IN (HINDI)' },
  { code: 'it-IT', name: 'IT-IT (ITALIAN)' },
  { code: 'ja-JP', name: 'JA-JP (JAPANESE)' },
  { code: 'pt-BR', name: 'PT-BR (PORTUGUESE)' },
  { code: 'zh-CN', name: 'ZH-CN (CHINESE)' },
  { code: 'ar-SA', name: 'AR-SA (ARABIC)' }
];

export function LandingScreen({ onStart, onStartBattle, selectedLanguage, setSelectedLanguage }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      className="landing-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Logo */}
      <motion.div
        className="landing-logo"
        animate={{ y: [0, -6, 0] }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: 'easeInOut',
        }}
      >
        <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>track_changes</span>
      </motion.div>

      {/* Title */}
      <motion.h1 className="landing-title" variants={itemVariants}>
        Speak<span className="text-teal">Spin</span>
      </motion.h1>

      {/* Tagline */}
      <motion.p className="landing-tagline" variants={itemVariants}>
        Master public speaking with AI-powered coaching
      </motion.p>

      {/* Large Intimidating Battle Mode Featured Card matching the reference design */}
      <motion.div
        className="landing-battle-card"
        variants={itemVariants}
      >
        {/* Crossed Swords with Red Glow */}
        <span 
          className="material-symbols-outlined" 
          style={{ 
            fontSize: '5rem', 
            display: 'block', 
            margin: '0 auto 1.5rem', 
            color: '#c0c0c0',
            filter: 'drop-shadow(0 0 15px rgba(255, 0, 0, 0.95))',
            fontVariationSettings: "'FILL' 1"
          }}
        >
          swords
        </span>

        {/* Start Battle Solid Red Banner Button */}
        <button
          className="landing-battle-btn"
          onClick={onStartBattle}
          style={{ marginBottom: '1.25rem' }}
        >
          START BATTLE
        </button>

        {/* Choose Language Selector Dropdown (Shadcn style popover) */}
        <div style={{ position: 'relative', width: '100%', textAlign: 'left', marginBottom: '2.5rem' }} ref={dropdownRef}>
          <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#888888', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-heading)' }}>
            Choose a Language
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: '100%',
              backgroundColor: '#000000',
              color: '#ffffff',
              border: '2px solid #ffffff',
              padding: '0.65rem 1rem',
              fontWeight: 900,
              fontSize: '0.85rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderRadius: '0px',
              fontFamily: 'var(--font-heading)'
            }}
          >
            <span>{SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name || 'EN-US (ENGLISH)'}</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              keyboard_arrow_down
            </span>
          </button>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.1 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '100%',
                  backgroundColor: '#000000',
                  border: '2px solid #ffffff',
                  borderTop: 'none',
                  zIndex: 99,
                  maxHeight: '180px',
                  overflowY: 'auto',
                  borderRadius: '0px',
                  boxShadow: '4px 4px 0px 0px #ffffff'
                }}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <div
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '0.6rem 1rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 900,
                      color: selectedLanguage === lang.code ? '#ff3333' : '#ffffff',
                      borderBottom: '1px solid #111111',
                      backgroundColor: '#000000',
                      transition: 'background-color 0.1s, color 0.1s',
                      fontFamily: 'var(--font-heading)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#111111';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#000000';
                    }}
                  >
                    {lang.name}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Capitalized Description Text */}
        <p style={{ 
          fontSize: '0.9rem', 
          color: '#ffffff', 
          lineHeight: '1.6', 
          margin: 0, 
          textTransform: 'uppercase', 
          fontWeight: 900, 
          letterSpacing: '0.08em',
          fontFamily: 'var(--font-heading)'
        }}>
          DUEL REAL SPEAKERS LIVE. CLIMB THE ELO LADDER.<br />
          PROVE YOUR SPEECH DOMINANCE.
        </p>
      </motion.div>

      {/* Action buttons */}
      <motion.div className="landing-actions" variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '350px', margin: '0 auto' }}>
        <motion.button
          className="btn btn-secondary"
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '0.8rem',
            borderColor: '#333333',
            color: '#888888',
            background: 'transparent',
            boxShadow: 'none',
            borderRadius: '0px'
          }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
        >
          <span className="material-symbols-outlined text-xs">rocket_launch</span>
          Practice Solo (Training Mode)
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default LandingScreen;
