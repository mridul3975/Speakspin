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
      color: '#ffffff',
      padding: '1rem',
      boxSizing: 'border-box'
    }}>
      {/* Dynamic CRT Scanline Styles */}
      <style>{`
        .crt-cyberpunk {
          background-color: #050505;
          font-family: 'Montserrat', sans-serif;
          background-image: linear-gradient(#111111 1px, transparent 1px),
                            linear-gradient(90deg, #111111 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .crt-scanlines {
          position: relative;
        }
        .crt-scanlines::before {
          content: " ";
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: linear-gradient(to bottom, rgba(255,255,255,0) 50%, rgba(0, 0, 0, 0.18) 50%);
          background-size: 100% 4px;
          z-index: 5;
          pointer-events: none;
        }
        .retro-input:focus {
          border-color: #ffffff !important;
          outline: none;
        }
      `}</style>

      {/* Main Terminal Frame */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: '#0a0a0a',
        border: '1px solid #404040',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Terminal Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid #404040',
          backgroundColor: '#141414'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '0.15em', color: '#ffffff' }}>
            SYS.SPKSPN_
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: '#00ff66', fontWeight: 600 }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: '#00ff66', borderRadius: '50%', display: 'inline-block', animate: 'pulse 1.5s infinite' }} />
            SYS_ONLINE
          </div>
        </div>

        {/* Inner Content Grid */}
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '100%' }}>
          {/* Left Sidebar Profile Section */}
          <div style={{
            width: '100%',
            maxWidth: '280px',
            borderRight: '1px solid #404040',
            padding: '1.5rem',
            boxSizing: 'border-box',
            backgroundColor: '#050505',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{ fontSize: '0.65rem', color: '#a3a3a3', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>terminal</span>
              USER_IDENTIFICATION
            </div>

            {/* Square Avatar Box */}
            <div className="crt-scanlines" style={{
              width: '100%',
              aspectRatio: '1',
              border: '1px solid #404040',
              padding: '0.75rem',
              backgroundColor: '#0a0a0a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer'
            }} onClick={() => setIsEditingAvatar(!isEditingAvatar)}>
              <div style={{ fontSize: '5rem', userSelect: 'none' }}>
                {avatar}
              </div>
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                backgroundColor: '#000000',
                border: '1px solid #404040',
                padding: '0.2rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#ffffff' }}>edit</span>
              </div>
            </div>

            {/* Avatar Picker Panel */}
            <AnimatePresence>
              {isEditingAvatar && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ border: '1px dashed #404040', padding: '0.5rem', backgroundColor: '#000000' }}
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
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    textAlign: 'center',
                    border: '1px solid #404040',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    padding: '0.4rem',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <div 
                  onClick={() => setIsEditingName(true)}
                  style={{ fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', color: '#ffffff' }}
                >
                  {playerName}
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', opacity: 0.6 }}>edit</span>
                </div>
              )}
              <div style={{ fontSize: '0.65rem', color: '#a3a3a3' }}>ID: SPEAKER_#{Math.floor(1000 + (rating % 9000))}</div>
            </div>

            {/* ELO Rank Box */}
            <div style={{
              border: '1px solid #404040',
              padding: '0.75rem',
              backgroundColor: '#0a0a0a',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#a3a3a3' }}>RANK:</span>
                <span style={{ color: tier.color, fontWeight: 'bold' }}>{tier.name.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#a3a3a3' }}>ELO:</span>
                <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{String(rating).padStart(4, '0')}</span>
              </div>
            </div>

            {/* Sidebar Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
              <button onClick={onViewProfile} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', border: 'none', background: 'none', color: '#a3a3a3', cursor: 'pointer', textAlign: 'left', fontSize: '0.75rem', padding: '0.25rem 0' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>analytics</span>
                &gt; VIEW_PROFILE
              </button>
              <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', border: 'none', background: 'none', color: '#ff3333', cursor: 'pointer', textAlign: 'left', fontSize: '0.75rem', padding: '0.25rem 0', fontWeight: 'bold' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_back</span>
                &gt; ABORT_SESSION
              </button>
            </div>
          </div>

          {/* Right Area (Matchmaking Protocol Console) */}
          <div style={{
            flex: 1,
            padding: '1.5rem',
            boxSizing: 'border-box',
            backgroundColor: '#0a0a0a',
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
              borderBottom: '1px solid #404040',
              paddingBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#ffffff' }}>swords</span>
                <h1 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.15em', margin: 0 }}>BATTLE_PROTOCOL</h1>
              </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ border: '1px solid #404040', padding: '0.75rem', backgroundColor: '#050505' }}>
                <div style={{ fontSize: '0.6rem', color: '#a3a3a3', marginBottom: '0.25rem' }}>&gt; SYS_STATUS_RECORD</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  {String(wins).padStart(2, '0')}W / {String(losses).padStart(2, '0')}L / {String(draws).padStart(2, '0')}D
                </div>
              </div>
              <div style={{ border: '1px solid #404040', padding: '0.75rem', backgroundColor: '#050505' }}>
                <div style={{ fontSize: '0.6rem', color: '#a3a3a3', marginBottom: '0.25rem' }}>&gt; ACTIVE_STREAK</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: streak >= 3 ? '#ff3333' : '#ffffff' }}>local_fire_department</span>
                  {String(streak).padStart(2, '0')}_STREAK
                </div>
              </div>
            </div>

            {/* progression slider */}
            <div style={{ border: '1px solid #404040', padding: '1rem', backgroundColor: '#050505' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#a3a3a3', marginBottom: '0.5rem' }}>
                <span>&gt; TIER_PROGRESSION_CALCULATING</span>
                <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{Math.round(progressPercent)}.00%</span>
              </div>
              <div style={{ height: '14px', border: '1px solid #404040', padding: '1px', backgroundColor: '#000000' }}>
                <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: '#ffffff', position: 'relative' }}>
                  <div className="crt-scanlines" style={{ position: 'absolute', inset: 0, opacity: 0.3 }} />
                </div>
              </div>
            </div>

            {/* Matchmaking controls */}
            <div style={{
              border: '1px solid #404040',
              padding: '1.25rem',
              backgroundColor: '#050505',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* Speaking Language Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.6rem', color: '#a3a3a3' }}>
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
                      padding: '0.65rem',
                      backgroundColor: '#000000',
                      border: '1px solid #404040',
                      color: '#ffffff',
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '0.8rem',
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
                  <div style={{ pointerEvents: 'none', position: 'absolute', insetY: 0, right: 0, display: 'flex', alignItems: 'center', paddingRight: '8px', color: '#ffffff' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_drop_down</span>
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
                  border: '1px solid #ffffff',
                  padding: '0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s, color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#000000';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>radar</span>
                INITIATE_MATCHMAKING
              </button>
            </div>

            {/* Custom Terminal Table Leaderboard */}
            <div style={{ border: '1px solid #404040', padding: '1rem', backgroundColor: '#050505' }}>
              <div style={{ fontSize: '0.65rem', color: '#a3a3a3', marginBottom: '0.75rem' }}>
                &gt; LEADERBOARD_STATUS_LOG
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem' }}>
                {leaderboard.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: item.isYou ? '#141414' : 'transparent',
                    border: item.isYou ? '1px solid #404040' : 'none',
                    fontWeight: item.isYou ? 'bold' : 'normal'
                  }}>
                    <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ color: '#a3a3a3' }}>[{idx + 1}]</span>
                      <span>{item.avatar} {item.name}</span>
                    </span>
                    <span style={{ color: item.isYou ? '#00ff66' : '#ffffff' }}>
                      {String(item.rating).padStart(4, '0')} ELO
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Collapsible How It Works */}
            <div style={{ border: '1px solid #404040', backgroundColor: '#050505' }}>
              <div
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '0.65rem 0.75rem', fontSize: '0.7rem', fontWeight: 'bold' }}
              >
                <span>&gt; PROTOCOL_RULES_LOG.TXT</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {showHowItWorks ? 'expand_less' : 'expand_more'}
                </span>
              </div>
              <AnimatePresence>
                {showHowItWorks && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden', padding: '0.75rem', fontSize: '0.7rem', lineHeight: '1.5', borderTop: '1px solid #404040', color: '#a3a3a3' }}
                  >
                    <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
                      <li style={{ marginBottom: '0.4rem' }}><strong>SBM_MATCH:</strong> Connects with players within Rating threshold.</li>
                      <li style={{ marginBottom: '0.4rem' }}><strong>SYNC_TOPIC:</strong> Simultaneous random category prompts.</li>
                      <li style={{ marginBottom: '0.4rem' }}><strong>JUDGE_AI:</strong> Rubric evaluations via speech parameters.</li>
                      <li><strong>ELO_GAIN:</strong> Gained ELO ratings persist to account.</li>
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 1rem',
          borderTop: '1px solid #404040',
          backgroundColor: '#141414',
          fontSize: '0.6rem',
          color: '#a3a3a3'
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
