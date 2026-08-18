import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RatingBadge, { getTier } from './RatingBadge';
import AvatarSelector from './AvatarSelector';

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

export function BattleLobby({ user, onFindMatch, onBack, onViewProfile, selectedLanguage, onChangeLanguage }) {
  // Load stats from localStorage
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('speakspin-player-name') || user.name || `SPEAKER_${Math.floor(1000 + Math.random() * 9000)}`;
  });
  const [avatar, setAvatar] = useState(() => {
    return localStorage.getItem('speakspin-player-avatar') || '🦁';
  });
  const [rating, setRating] = useState(() => {
    const r = localStorage.getItem('speakspin-rating');
    return r ? Number(r) : 1000;
  });
  const [wins, setWins] = useState(() => Number(localStorage.getItem('speakspin-wins')) || 0);
  const [losses, setLosses] = useState(() => Number(localStorage.getItem('speakspin-losses')) || 0);
  const [draws, setDraws] = useState(() => Number(localStorage.getItem('speakspin-draws')) || 0);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('speakspin-win-streak')) || 0);

  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  // Initialize rating defaults if not set
  useEffect(() => {
    if (!localStorage.getItem('speakspin-rating')) {
      localStorage.setItem('speakspin-rating', 1000);
      localStorage.setItem('speakspin-wins', 0);
      localStorage.setItem('speakspin-losses', 0);
      localStorage.setItem('speakspin-draws', 0);
      localStorage.setItem('speakspin-win-streak', 0);
    }
  }, []);

  // Dynamically load Montserrat font
  useEffect(() => {
    if (!document.getElementById('montserrat-font')) {
      const link = document.createElement('link');
      link.id = 'montserrat-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const handleSaveName = (newName) => {
    const cleaned = newName.trim().toUpperCase().substring(0, 15);
    if (cleaned) {
      setPlayerName(cleaned);
      localStorage.setItem('speakspin-player-name', cleaned);
    }
    setIsEditingName(false);
  };

  const handleSaveAvatar = (newEmoji) => {
    setAvatar(newEmoji);
    localStorage.setItem('speakspin-player-avatar', newEmoji);
    setIsEditingAvatar(false);
  };

  // ELO Progress calculation to next tier
  const tier = getTier(rating);
  const getNextTierThreshold = (currentRating) => {
    if (currentRating < 800) return 800;
    if (currentRating < 1000) return 1000;
    if (currentRating < 1200) return 1200;
    if (currentRating < 1400) return 1400;
    if (currentRating < 1600) return 1600;
    return 2000; 
  };
  const getPrevTierThreshold = (currentRating) => {
    if (currentRating < 800) return 0;
    if (currentRating < 1000) return 800;
    if (currentRating < 1200) return 1000;
    if (currentRating < 1400) return 1200;
    if (currentRating < 1600) return 1400;
    return 1600;
  };

  const nextThreshold = getNextTierThreshold(rating);
  const prevThreshold = getPrevTierThreshold(rating);
  const progressPercent = Math.min(100, Math.max(0, ((rating - prevThreshold) / (nextThreshold - prevThreshold)) * 100));



  return (
    <div className="crt-cyberpunk" style={{
      fontFamily: "'Montserrat', sans-serif",
      width: '100%',
      minHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      color: '#ffffff',
      padding: '1.5rem 1rem',
      boxSizing: 'border-box'
    }}>
      {/* Dynamic Brutalist Styles */}
      <style>{`
        .crt-cyberpunk {
          background-color: #000000;
        }
        .retro-input:focus {
          border-color: #ffffff !important;
          outline: none;
        }
        .brutalist-card-hover {
          transition: background-color 0.25s, color 0.25s;
        }
        .brutalist-card-hover:hover {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        .brutalist-card-hover:hover * {
          color: #000000 !important;
        }
      `}</style>

      {/* Main Brutalist Frame */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: '#000000',
        border: '4px solid #ffffff',
        boxShadow: '8px 8px 0px 0px #ffffff',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          borderBottom: '4px solid #ffffff',
          backgroundColor: '#000000'
        }}>
          <div style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '0.15em', color: '#ffffff' }}>
            SPEAKSPIN
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#ffffff', fontWeight: 900, textTransform: 'uppercase' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#ff3333', borderRadius: '50%', display: 'inline-block' }} />
            BATTLE MODE
          </div>
        </div>

        {/* Inner Content Grid */}
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '100%' }}>
          {/* Left Sidebar Profile Section */}
          <div style={{
            width: '100%',
            maxWidth: '280px',
            borderRight: '4px solid #ffffff',
            padding: '1.5rem',
            boxSizing: 'border-box',
            backgroundColor: '#000000',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person</span>
              YOUR PROFILE
            </div>

            {/* Square Avatar Box */}
            <div style={{
              width: '100%',
              aspectRatio: '1',
              border: '3px solid #ffffff',
              padding: '0.75rem',
              backgroundColor: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer'
            }} onClick={() => setIsEditingAvatar(!isEditingAvatar)}>
              <div style={{ fontSize: '5.5rem', userSelect: 'none' }}>
                {avatar}
              </div>
              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                backgroundColor: '#ffffff',
                border: '2px solid #000000',
                padding: '0.2rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#000000' }}>edit</span>
              </div>
            </div>

            {/* Avatar Picker Panel */}
            <AnimatePresence>
              {isEditingAvatar && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ border: '2px dashed #ffffff', padding: '0.5rem', backgroundColor: '#000000' }}
                >
                  <AvatarSelector selectedAvatar={avatar} onSelect={handleSaveAvatar} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name Input / Output */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {isEditingName ? (
                <input
                  type="text"
                  maxLength={15}
                  defaultValue={playerName}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(e.target.value); }}
                  onBlur={(e) => handleSaveName(e.target.value)}
                  autoFocus
                  className="retro-input"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 900,
                    fontSize: '1rem',
                    textAlign: 'center',
                    border: '3px solid #ffffff',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    padding: '0.4rem',
                    width: '100%',
                    boxSizing: 'border-box',
                    borderRadius: '0px'
                  }}
                />
              ) : (
                <div 
                  onClick={() => setIsEditingName(true)}
                  style={{ fontWeight: 900, fontSize: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', color: '#ffffff' }}
                >
                  {playerName}
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', opacity: 0.8 }}>edit</span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 800, marginTop: '0.5rem', borderTop: '2px solid #ffffff', paddingTop: '0.5rem' }}>
                <div>RANK: {tier.name.toUpperCase()}</div>
                <div>ELO: {rating}</div>
              </div>
            </div>

            {/* Sidebar Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
              <button onClick={onViewProfile} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', border: '2px solid #ffffff', background: 'none', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontSize: '0.75rem', padding: '0.5rem', fontWeight: 900, textTransform: 'uppercase' }} className="brutalist-card-hover">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>analytics</span>
                &gt; VIEW_PROFILE
              </button>
              <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', border: '2px solid #ff3333', background: 'none', color: '#ff3333', cursor: 'pointer', textAlign: 'left', fontSize: '0.75rem', padding: '0.5rem', fontWeight: 900, textTransform: 'uppercase' }} className="brutalist-card-hover">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                &gt; BACK TO HOME
              </button>
            </div>
          </div>

          {/* Right Area (Matchmaking Console) */}
          <div style={{
            flex: 1,
            padding: '1.5rem',
            boxSizing: 'border-box',
            backgroundColor: '#000000',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            minWidth: '300px'
          }}>
            {/* Title */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #ffffff',
              paddingBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#ffffff' }}>swords</span>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.1rem', margin: 0 }}>BATTLE DASHBOARD</h1>
              </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderBottom: '3px solid #ffffff', paddingBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#ffffff', opacity: 0.7, marginBottom: '0.25rem', fontWeight: 900 }}>RECORD</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                  {wins}W - {losses}L - {draws}D
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#ffffff', opacity: 0.7, marginBottom: '0.25rem', fontWeight: 900 }}>WIN STREAK</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ff3333' }}>local_fire_department</span>
                  {streak} WINS
                </div>
              </div>
            </div>



            {/* Matchmaking controls */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              marginTop: '1rem'
            }}>
              {/* Speaking Language Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.7rem', color: '#ffffff', opacity: 0.7, fontWeight: 900 }}>
                  SELECT LANGUAGE
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <select
                    value={selectedLanguage || 'en-US'}
                    onChange={(e) => {
                      if (onChangeLanguage) onChangeLanguage(e.target.value);
                      localStorage.setItem('speakspin-battle-language', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#000000',
                      border: '3px solid #ffffff',
                      color: '#ffffff',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      borderRadius: '0px',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none'
                    }}
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                  <div style={{ pointerEvents: 'none', position: 'absolute', top: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', paddingRight: '10px', color: '#ffffff' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_drop_down</span>
                  </div>
                </div>
              </div>

              {/* Initiate matchmaking button */}
              <button
                onClick={() => onFindMatch({ playerName, avatar, rating, language: selectedLanguage })}
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: '3px solid #ffffff',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 900,
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.25s, color 0.25s',
                  boxShadow: '4px 4px 0px 0px #ffffff'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#000000';
                  e.currentTarget.style.boxShadow = '4px 4px 0px 0px #ffffff';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>radar</span>
                FIND A MATCH
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          borderTop: '4px solid #ffffff',
          backgroundColor: '#000000',
          fontSize: '0.7rem',
          color: '#ffffff',
          fontWeight: 900
        }}>
          <div>SYS.V.2026 (c) SPKSPN</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span>[TERMS]</span>
            <span>[PRIVACY]</span>
            <span>[SUPPORT]</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattleLobby;
