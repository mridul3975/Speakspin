import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RatingBadge, { getTier } from './RatingBadge';
import AvatarSelector from './AvatarSelector';

export function BattleLobby({ user, onFindMatch, onBack }) {
  // Load stats from localStorage
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('speakspin-player-name') || user.name || `Speaker${Math.floor(1000 + Math.random() * 9000)}`;
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

  const handleSaveName = (newName) => {
    const cleaned = newName.trim().substring(0, 15);
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
    return 2000; // Legend ceiling for progress
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
    { name: 'GrandOrator', rating: 1820, avatar: '👑', isYou: false },
    { name: 'VoiceMaster', rating: 1650, avatar: '🔮', isYou: false },
    { name: 'TalkChamp', rating: 1420, avatar: '💎', isYou: false },
    { name: playerName, rating: rating, avatar: avatar, isYou: true },
    { name: 'WordSmith', rating: 1180, avatar: '🥇', isYou: false }
  ].sort((a, b) => b.rating - a.rating);

  return (
    <div className="setup-container" style={{ margin: '1rem auto 3rem', maxWidth: '650px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Floating Particles */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.15 }}>
        {Array.from({ length: 15 }).map((_, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              width: '6px',
              height: '6px',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `spin ${5 + Math.random() * 10}s linear infinite`
            }}
          />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button className="btn-back-ghost" onClick={onBack}>
            <span className="material-symbols-outlined text-sm">arrow_back</span> LEAVE
          </button>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            ⚔️ BATTLE MODE
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent-teal)', borderRadius: '50%', display: 'inline-block' }} />
            ONLINE
          </div>
        </div>

        {/* Profile Card */}
        <div style={{ border: '4px solid #ffffff', padding: '2rem 1.5rem', backgroundColor: '#0a0a1a', textAlign: 'center', boxShadow: '8px 8px 0px 0px #ffffff', marginBottom: '2rem' }}>
          {/* Avatar Slot */}
          <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }} onClick={() => setIsEditingAvatar(true)}>
            <div style={{ fontSize: '4.5rem', lineHeight: '1', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }}>
              {avatar}
            </div>
            <span className="material-symbols-outlined" style={{ position: 'absolute', bottom: 0, right: 0, background: '#ffffff', color: '#000000', fontSize: '1rem', padding: '0.2rem', border: '1.5px solid #000000' }}>
              edit
            </span>
          </div>

          {/* Avatar Selector Overlay */}
          <AnimatePresence>
            {isEditingAvatar && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{ border: '2px dashed #ffffff', padding: '1rem', marginTop: '1rem', backgroundColor: 'rgba(0,0,0,0.5)' }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Select Avatar Emoji</div>
                <AvatarSelector selectedAvatar={avatar} onSelect={handleSaveAvatar} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name Editor */}
          <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
            {isEditingName ? (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <input
                  type="text"
                  maxLength={15}
                  defaultValue={playerName}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(e.target.value); }}
                  onBlur={(e) => handleSaveName(e.target.value)}
                  autoFocus
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 900,
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    border: '2px solid #ffffff',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    padding: '0.2rem 0.5rem',
                    width: '200px'
                  }}
                />
              </div>
            ) : (
              <h3 
                onClick={() => setIsEditingName(true)}
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.75rem', cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase' }}
              >
                {playerName}
                <span className="material-symbols-outlined text-sm" style={{ opacity: 0.6 }}>edit</span>
              </h3>
            )}
          </div>

          {/* ELO Rating Badge */}
          <div style={{ margin: '0.75rem 0' }}>
            <RatingBadge rating={rating} />
          </div>

          {/* Progress Bar to next Tier */}
          <div style={{ maxWidth: '300px', margin: '1rem auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              <span>PROGESS TO NEXT TIER</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div style={{ height: '8px', border: '1px solid #ffffff', backgroundColor: '#000000', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: getTier(rating).color }} />
            </div>
          </div>

          {/* Battle Record Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block' }}>RECORD</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.1rem' }}>
                {wins}W - {losses}L - {draws}D
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block' }}>WIN STREAK</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.1rem', color: streak >= 3 ? 'var(--accent-coral)' : '#ffffff' }}>
                🔥 {streak} {streak >= 3 && 'ON FIRE'}
              </span>
            </div>
          </div>
        </div>

        {/* Find Match Pulsing Button */}
        <motion.button
          onClick={() => onFindMatch({ playerName, avatar, rating })}
          className="btn btn-primary"
          style={{
            width: '100%',
            fontSize: '1.5rem',
            padding: '1.25rem',
            backgroundColor: '#FF416C',
            borderColor: '#FF4B2B',
            boxShadow: '0 0 15px rgba(255, 65, 108, 0.4)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 900,
            letterSpacing: '0.05em',
            marginBottom: '2rem'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ⚔️ FIND BATTLE
        </motion.button>

        {/* Collapsible How it works */}
        <div style={{ border: '2px solid #ffffff', padding: '1rem', backgroundColor: '#0a0a1a', marginBottom: '2rem' }}>
          <div
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem' }}
          >
            <span>📜 HOW IT WORKS</span>
            <span className="material-symbols-outlined">
              {showHowItWorks ? 'expand_less' : 'expand_more'}
            </span>
          </div>
          <AnimatePresence>
            {showHowItWorks && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden', marginTop: '0.75rem', fontSize: '0.8rem', lineHeight: '1.5', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem', color: 'var(--text-secondary)' }}
              >
                <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
                  <li style={{ marginBottom: '0.5rem' }}><strong>Skill-based Matchmaking</strong>: Matches you with competitors of similar ELO tier.</li>
                  <li style={{ marginBottom: '0.5rem' }}><strong>Synchronized Speech</strong>: Both speakers are given the same random category topic.</li>
                  <li style={{ marginBottom: '0.5rem' }}><strong>Toastmasters AI Judging</strong>: The AI evaluates and grades both speeches.</li>
                  <li><strong>Win rating points</strong>: Winners gain ELO points to climb the competitive leagues.</li>
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Leaderboard Snippet */}
        <div style={{ border: '2px solid #ffffff', padding: '1.25rem', backgroundColor: '#000000' }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.9rem', margin: '0 0 1rem 0', borderBottom: '1px solid #ffffff', paddingBottom: '0.5rem' }}>
            📊 TOP WEEKLY SPEAKERS
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {leaderboard.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  border: item.isYou ? '1px dashed #ffffff' : 'none',
                  backgroundColor: item.isYou ? 'rgba(255,255,255,0.05)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{idx + 1}.</span>
                  <span style={{ fontSize: '1.25rem' }}>{item.avatar}</span>
                  <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem', color: item.isYou ? 'var(--accent-teal)' : '#ffffff' }}>
                    {item.name} {item.isYou && '(YOU)'}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '0.85rem' }}>
                  {item.rating} ELO
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default BattleLobby;
