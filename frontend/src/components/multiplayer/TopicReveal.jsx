import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { translateTopic } from '../../utils/api';

export function TopicReveal({ topic, category, duration, startCountdown, selectedLanguage }) {
  const [translatedTopic, setTranslatedTopic] = useState(topic);
  const [words, setWords] = useState([]);
  const [visibleWordsCount, setVisibleWordsCount] = useState(0);

  useEffect(() => {
    let active = true;
    if (selectedLanguage && !selectedLanguage.startsWith('en')) {
      translateTopic(topic, selectedLanguage).then((res) => {
        if (active && res && res.translated) {
          setTranslatedTopic(res.translated);
        }
      });
    } else {
      setTranslatedTopic(topic);
    }
    return () => {
      active = false;
    };
  }, [topic, selectedLanguage]);

  useEffect(() => {
    if (translatedTopic) {
      setWords(translatedTopic.split(' '));
      setVisibleWordsCount(0); // Reset progress on new word list
    }
  }, [translatedTopic]);

  // Word-by-word typewriter reveal animation
  useEffect(() => {
    if (words.length === 0) return;
    const timer = setInterval(() => {
      setVisibleWordsCount((prev) => {
        if (prev >= words.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1500 / words.length); // complete reveal in ~1.5s
    return () => clearInterval(timer);
  }, [words]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#05050f',
        color: '#ffffff',
        zIndex: 99,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center'
      }}
    >
      <div style={{ maxWidth: '600px', border: '4px solid #ffffff', padding: '3rem 2rem', backgroundColor: '#000000', boxShadow: '8px 8px 0px 0px #ffffff' }}>
        
        {/* Category Badge */}
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="winner-category-tag"
          style={{ display: 'inline-block', marginBottom: '1rem' }}
        >
          {category}
        </motion.span>

        {/* Typewriter topic title */}
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.8rem', lineHeight: '1.4', margin: '0 0 1.5rem 0', minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span>{words.slice(0, visibleWordsCount).join(' ')}</span>
          {translatedTopic !== topic && visibleWordsCount >= words.length && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              style={{ fontSize: '1rem', fontWeight: 'normal' }}
            >
              (English: "{topic}")
            </motion.span>
          )}
        </h2>

        {/* Duration badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginBottom: '2rem' }}
        >
          ⏱️ {duration} SECONDS SPEECH
        </motion.div>

        {/* Sync Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.0 }}
        >
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Battle Starts In:
          </span>
          <div style={{ fontSize: '4.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: startCountdown <= 1 ? 'var(--accent-coral)' : '#ffffff', animation: 'pulse 1s infinite' }}>
            {startCountdown === 0 ? 'GO! 🎤' : startCountdown}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default TopicReveal;
