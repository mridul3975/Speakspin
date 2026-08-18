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
  const [showHowItWorks, setShowHowItWorks] = useState(false);

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

  // Leaderboard mock generator
  const leaderboard = [
    { name: 'GRAND_ORATOR', rating: 1820, avatar: '👑', isYou: false },
    { name: 'VOICE_MASTER', rating: 1650, avatar: '🔮', isYou: false },
    { name: 'TALK_CHAMP', rating: 1420, avatar: '💎', isYou: false },
    { name: playerName, rating: rating, avatar: avatar, isYou: true },
    { name: 'WORD_SMITH', rating: 1180, avatar: '🥇', isYou: false }
  ].sort((a, b) => b.rating - a.rating);

  return (
    <div className="crt-cyberpunk" style={{
      fontFamily: "'Montserrat', sans-serif",
      width: '100%',
      minHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      color: 'var(--text-primary)',
      padding: '2rem 1rem',
      boxSizing: 'border-box'
    }}>
      {/* Dynamic Cyberpunk Styles */}
      <style>{`
        .retro-input:focus {
          border-color: var(--accent-cyan) !important;
          box-shadow: 0 0 10px var(--accent-cyan-glow);
          outline: none;
        }
        .lobby-btn-hover {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lobby-btn-hover:hover {
          background-color: var(--accent-cyan) !important;
          color: #000000 !important;
          box-shadow: 0 0 15px var(--accent-cyan-glow);
          transform: translateY(-1px);
        }
        .lobby-btn-hover:hover * {
          color: #000000 !important;
        }
        .lobby-btn-exit-hover {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lobby-btn-exit-hover:hover {
          background-color: #ef4444 !important;
          color: #ffffff !important;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
          transform: translateY(-1px);
        }
        .lobby-btn-exit-hover:hover * {
          color: #ffffff !important;
        }
      `}</style>

      {/* Main Cyberpunk Frame */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(12px)',
        border: 'var(--border-glow)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderBottom: 'var(--border-glow)',
          backgroundColor: 'var(--bg-card-alt)'
        }}>
          <div style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.15em', color: 'var(--accent-cyan)', filter: 'drop-shadow(0 0 8px var(--accent-cyan-glow))' }}>
            SPEAKSPIN
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent-rose)', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px var(--accent-rose-glow)' }} />
            BATTLE_PORTAL
          </div>
        </div>

        {/* Inner Content Grid */}
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '100%' }}>
          {/* Left Sidebar Profile Section */}
          <div style={{
            width: '100%',
            maxWidth: '280px',
            borderRight: 'var(--border-glow)',
            padding: '1.5rem',
            boxSizing: 'border-box',
            backgroundColor: 'rgba(20, 20, 23, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>terminal</span>
              IDENT_INFO
            </div>

            {/* Square Avatar Box */}
            <div style={{
              width: '100%',
              aspectRatio: '1',
              border: 'var(--border-glow)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              backgroundColor: 'var(--bg-card-alt)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer'
            }} onClick={() => setIsEditingAvatar(!isEditingAvatar)}>
              <div style={{ fontSize: '5.5rem', userSelect: 'none', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}>
                {avatar}
              </div>
              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                backgroundColor: 'var(--accent-cyan)',
                borderRadius: '50%',
                padding: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 8px var(--accent-cyan-glow)'
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
                  style={{ border: '1px dashed var(--accent-cyan)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', backgroundColor: 'var(--bg-card-alt)' }}
                >
                  <AvatarSelector selectedAvatar={avatar} onSelect={handleSaveAvatar} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name Input / Output */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                    border: '1px solid var(--accent-cyan)',
                    backgroundColor: 'var(--bg-card-alt)',
                    color: 'var(--text-primary)',
                    padding: '0.5rem',
                    width: '100%',
                    boxSizing: 'border-box',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
              ) : (
                <div 
                  onClick={() => setIsEditingName(true)}
                  style={{ fontWeight: 800, fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', textTransform: 'uppercase', color: 'var(--text-primary)' }}
                >
                  {playerName}
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--accent-cyan)', opacity: 0.8 }}>edit</span>
                </div>
              )}
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.8, fontWeight: 700 }}>USR-#{Math.floor(1000 + (rating % 9000))}</div>
            </div>

            {/* ELO Rank Box */}
            <div style={{
              border: 'var(--border-glow)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              backgroundColor: 'var(--bg-card-alt)',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontWeight: 800
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>RANK:</span>
                <span style={{ color: 'var(--accent-cyan)' }}>{tier.name.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>ELO:</span>
                <span style={{ color: 'var(--text-primary)' }}>{String(rating).padStart(4, '0')}</span>
              </div>
            </div>

            {/* Sidebar Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
              <button onClick={onViewProfile} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', border: 'var(--border-glow)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card-alt)', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', fontSize: '0.75rem', padding: '0.65rem 0.75rem', fontWeight: 800, textTransform: 'uppercase' }} className="lobby-btn-hover">
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--accent-cyan)' }}>analytics</span>
                &gt; VIEW_PROFILE
              </button>
              <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', cursor: 'pointer', textAlign: 'left', fontSize: '0.75rem', padding: '0.65rem 0.75rem', fontWeight: 800, textTransform: 'uppercase' }} className="lobby-btn-exit-hover">
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
            backgroundColor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            minWidth: '300px'
          }}>
            {/* Protocol Title */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: 'var(--border-glow)',
              paddingBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--accent-rose)' }}>swords</span>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.15em', margin: 0, color: 'var(--text-primary)' }}>BATTLE_PROTOCOL</h1>
              </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ border: 'var(--border-glow)', borderRadius: 'var(--radius-md)', padding: '0.85rem', backgroundColor: 'var(--bg-card-alt)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.8, marginBottom: '0.25rem', fontWeight: 900 }}>&gt; RECORD</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {String(wins).padStart(2, '0')}W / {String(losses).padStart(2, '0')}L / {String(draws).padStart(2, '0')}D
                </div>
              </div>
              <div style={{ border: 'var(--border-glow)', borderRadius: 'var(--radius-md)', padding: '0.85rem', backgroundColor: 'var(--bg-card-alt)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.8, marginBottom: '0.25rem', fontWeight: 900 }}>&gt; STREAK</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-rose)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>local_fire_department</span>
                  {String(streak).padStart(2, '0')}_STREAK
                </div>
              </div>
            </div>

            {/* Matchmaking controls */}
            <div style={{
              border: 'var(--border-glow)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              backgroundColor: 'var(--bg-card-alt)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              {/* Speaking Language Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.8, fontWeight: 900, letterSpacing: '0.05em' }}>
                  &gt; SELECT_COMM_PROTOCOL
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
                      padding: '0.85rem',
                      backgroundColor: 'var(--bg-card)',
                      border: 'var(--border-glow)',
                      color: 'var(--text-primary)',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none'
                    }}
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                  <div style={{ pointerEvents: 'none', position: 'absolute', top: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', paddingRight: '12px', color: 'var(--text-secondary)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_drop_down</span>
                  </div>
                </div>
              </div>

              {/* Initiate matchmaking button */}
              <button
                onClick={() => onFindMatch({ playerName, avatar, rating, language: selectedLanguage })}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, var(--accent-rose) 0%, #c084fc 100%)',
                  color: '#000000',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 0 15px var(--accent-rose-glow)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                  e.currentTarget.style.boxShadow = '0 0 25px var(--accent-rose-glow)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.filter = 'none';
                  e.currentTarget.style.boxShadow = '0 0 15px var(--accent-rose-glow)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>radar</span>
                INITIATE_MATCHMAKING
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderTop: 'var(--border-glow)',
          backgroundColor: 'var(--bg-card-alt)',
          fontSize: '0.7rem',
          color: 'var(--text-secondary)',
          fontWeight: 800
        }}>
          <div>SYS.V.2026 (c) SPKSPN</div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
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
