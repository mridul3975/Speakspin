import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTier } from './RatingBadge';
import { playWinnerFanfare, playLoserSound, playReactionPop, playRatingUp, playRatingDown } from '../../utils/battleAudio';

const REACTIONS = ['🔥', '😂', '👏', '😤', '🤝', '💀', '😎', '🫡'];

export function BattleResults({ user, results, myPosition, onSendReaction, onRematch, onNewOpponent, onLeave }) {
  const { winner, player1, player2 } = results;

  // Identify who is who
  const localIsP1 = myPosition === 'player1';
  const me = localIsP1 ? player1 : player2;
  const opponent = localIsP1 ? player2 : player1;

  const isWinner = me.overallScore > opponent.overallScore;
  const isDraw = me.overallScore === opponent.overallScore;

  const [activeTab, setActiveTab] = useState('mine'); // mine | transcripts
  const [floatingReactions, setFloatingReactions] = useState([]); // array of { id, emoji, left }
  const [opponentWantsRematch, setOpponentWantsRematch] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);

  // Play chimes on entry
  useEffect(() => {
    if (isDraw) {
      playWinnerFanfare(); // soft draw fanfare
    } else if (isWinner) {
      playWinnerFanfare();
      playRatingUp();
    } else {
      playLoserSound();
      playRatingDown();
    }

    // Save statistics in ELO history
    const savedWins = Number(localStorage.getItem('speakspin-wins')) || 0;
    const savedLosses = Number(localStorage.getItem('speakspin-losses')) || 0;
    const savedDraws = Number(localStorage.getItem('speakspin-draws')) || 0;
    const savedStreak = Number(localStorage.getItem('speakspin-win-streak')) || 0;

    localStorage.setItem('speakspin-rating', me.newRating);
    if (isWinner) {
      localStorage.setItem('speakspin-wins', savedWins + 1);
      localStorage.setItem('speakspin-win-streak', savedStreak + 1);
    } else if (isDraw) {
      localStorage.setItem('speakspin-draws', savedDraws + 1);
      localStorage.setItem('speakspin-win-streak', 0);
    } else {
      localStorage.setItem('speakspin-losses', savedLosses + 1);
      localStorage.setItem('speakspin-win-streak', 0);
    }

    // Save detailed Battle History Log
    const historyItem = {
      id: Date.now(),
      date: new Date().toISOString(),
      mode: 'battle',
      opponent: {
        name: opponent.name,
        avatar: opponent.avatar,
        rating: opponent.rating
      },
      topic: results.topic || '',
      category: results.category || 'Speech Battle',
      myScore: me.overallScore,
      opponentScore: opponent.overallScore,
      winner: isDraw ? 'draw' : (isWinner ? 'me' : 'opponent'),
      myRatingBefore: me.rating,
      myRatingAfter: me.newRating,
      ratingChange: me.ratingChange
    };

    const pastHistory = JSON.parse(localStorage.getItem('speakspin-battle-history') || '[]');
    pastHistory.unshift(historyItem);
    localStorage.setItem('speakspin-battle-history', JSON.stringify(pastHistory.slice(0, 50)));

    // Track best ELO rating achieved
    const bestRating = Number(localStorage.getItem('speakspin-best-rating')) || 1000;
    if (me.newRating > bestRating) {
      localStorage.setItem('speakspin-best-rating', me.newRating);
    }
  }, []);

  const handleSendReaction = (emoji) => {
    playReactionPop();
    const newReact = { id: Date.now() + Math.random(), emoji, left: 20 + Math.random() * 60 };
    setFloatingReactions(prev => [...prev, newReact]);
    onSendReaction(emoji);

    // Auto cleanup after 2s
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReact.id));
    }, 2000);
  };

  // Trigger when socket receives opponent's floating reaction
  useEffect(() => {
    const handleReceiveReaction = ({ reaction }) => {
      playReactionPop();
      const newReact = { id: Date.now() + Math.random(), emoji: reaction, left: 20 + Math.random() * 60 };
      setFloatingReactions(prev => [...prev, newReact]);
      setTimeout(() => {
        setFloatingReactions(prev => prev.filter(r => r.id !== newReact.id));
      }, 2000);
    };

    window.addEventListener('socket_reaction', handleReceiveReaction);
    return () => window.removeEventListener('socket_reaction', handleReceiveReaction);
  }, []);

  // Listen for rematch events
  useEffect(() => {
    const handleOpponentRematch = () => {
      setOpponentWantsRematch(true);
    };
    window.addEventListener('socket_opponent_wants_rematch', handleOpponentRematch);
    return () => window.removeEventListener('socket_opponent_wants_rematch', handleOpponentRematch);
  }, []);

  const triggerRematch = () => {
    setRematchRequested(true);
    onRematch();
  };

  return (
    <div className="setup-container" style={{ margin: '1rem auto 3rem', maxWidth: '700px', position: 'relative' }}>
      
      {/* Visual Confetti for Winner */}
      {isWinner && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 25 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                backgroundColor: ['#FFD700', '#FF416C', '#00FFFF', '#00FF00', '#FF00FF'][idx % 5],
                top: '-10px',
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `fall ${2 + Math.random() * 3}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Emoji Reactions Stream */}
      <div style={{ position: 'absolute', bottom: '150px', left: 0, right: 0, height: '300px', pointerEvents: 'none', zIndex: 10, overflow: 'hidden' }}>
        <AnimatePresence>
          {floatingReactions.map((react) => (
            <motion.div
              key={react.id}
              initial={{ y: 300, opacity: 0.8, scale: 0.8 }}
              animate={{ y: 0, opacity: 0, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: `${react.left}%`,
                fontSize: '2.5rem',
                lineHeight: 1
              }}
            >
              {react.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        
        {/* Results Banner card */}
        <div style={{
          border: '4px solid #ffffff',
          padding: '2.5rem 1.5rem',
          backgroundColor: '#000000',
          boxShadow: '8px 8px 0px 0px #ffffff',
          textAlign: 'center',
          marginBottom: '2rem',
          borderColor: isDraw ? '#ffffff' : (isWinner ? '#ffffff' : 'var(--accent-coral)')
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>BATTLE OUTCOME</span>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, textTransform: 'uppercase', margin: '0.5rem 0 1rem 0', letterSpacing: '-0.02em', color: isDraw ? '#ffffff' : (isWinner ? '#ffffff' : 'var(--accent-coral)') }}>
            {isDraw ? '🤝 DRAW BATTLE' : (isWinner ? '🏆 VICTORY!' : '💀 DEFEATED')}
          </h2>

          {/* Rating Change Display */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Rating: {me.rating} → <strong style={{ color: '#ffffff' }}>{me.newRating}</strong>
            </div>
            <span style={{
              fontSize: '0.95rem',
              fontWeight: 900,
              padding: '0.2rem 0.5rem',
              backgroundColor: isWinner ? 'rgba(255,255,255,0.1)' : (isDraw ? 'rgba(255,255,255,0.1)' : 'rgba(255,51,51,0.15)'),
              color: isWinner ? '#ffffff' : (isDraw ? '#ffffff' : 'var(--accent-coral)'),
              border: '1.5px solid currentColor'
            }}>
              {me.ratingChange >= 0 ? `+${me.ratingChange}` : me.ratingChange} {me.ratingChange >= 0 ? '📈' : '📉'}
            </span>
          </div>

          <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            {isWinner ? 'Triumphant performance! Keep climbing the ranks.' : (isDraw ? 'A close battle! Minor ELO adjustment.' : 'Study their speech logs below to learn and improve.')}
          </p>
        </div>

        {/* SCORE COMPARISON - YOURS HIGHLIGHTED & LARGER */}
        <div style={{ border: '4px solid #ffffff', padding: '1.5rem', backgroundColor: '#000000', marginBottom: '2rem', boxShadow: '5px 5px 0px 0px #ffffff' }}>
          <div className="score-comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.6fr 1.2fr', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>
            {/* Your Score */}
            <div style={{ padding: '1rem', border: '2px solid var(--accent-teal)', backgroundColor: 'rgba(0, 255, 200, 0.05)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>YOUR SCORE</span>
              <span style={{ fontSize: '4.5rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--accent-teal)', display: 'block', lineHeight: '1.1' }}>
                {me.overallScore}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>{me.name}</span>
            </div>

            {/* VS Divider */}
            <div className="score-comparison-vs" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-coral)', fontFamily: 'var(--font-heading)' }}>
              VS
            </div>

            {/* Opponent's Score */}
            <div style={{ padding: '1rem', border: '2px solid rgba(255,255,255,0.2)', opacity: 0.75 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>OPPONENT</span>
              <span style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#ffffff', display: 'block', lineHeight: '1.1', margin: '0.25rem 0' }}>
                {opponent.overallScore}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{opponent.name}</span>
            </div>
          </div>

          {/* Categories bar chart showing ONLY YOUR details */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.85rem', margin: '0 0 1rem 0', color: 'var(--accent-teal)' }}>
              🎯 YOUR CATEGORY SCORES
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {Object.keys(me.categories).map((catKey) => {
                const myVal = me.categories[catKey].score;
                return (
                  <div key={catKey}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      <span style={{ color: '#ffffff' }}>{catKey}</span>
                      <span style={{ color: 'var(--accent-teal)', fontWeight: 900 }}>{myVal}/100</span>
                    </div>
                    <div style={{ height: '6px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: '#000000' }}>
                      <div style={{ width: `${myVal}%`, height: '100%', backgroundColor: 'var(--accent-teal)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* EMOJI REACTIONS PANEL */}
        <div style={{ border: '2px solid #ffffff', padding: '1rem', backgroundColor: '#000000', marginBottom: '2rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
            SEND EMOJI REACTION TO OPPONENT
          </span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                style={{ fontSize: '1.75rem', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'transform 0.1s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs switcher: mine | transcripts */}
        <div style={{ display: 'flex', border: '2px solid #ffffff', borderBottom: 'none', backgroundColor: '#0a0a1a' }}>
          <button
            onClick={() => setActiveTab('mine')}
            style={{ flex: 1, padding: '0.75rem', border: 'none', background: activeTab === 'mine' ? '#ffffff' : 'transparent', color: activeTab === 'mine' ? '#000000' : '#ffffff', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            📋 MY FEEDBACK
          </button>
          <button
            onClick={() => setActiveTab('transcripts')}
            style={{ flex: 1, padding: '0.75rem', border: 'none', background: activeTab === 'transcripts' ? '#ffffff' : 'transparent', color: activeTab === 'transcripts' ? '#000000' : '#ffffff', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            📜 MY TRANSCRIPT
          </button>
        </div>

        <div style={{ border: '2px solid #ffffff', padding: '1.5rem', backgroundColor: '#000000', minHeight: '150px', marginBottom: '2rem' }}>
          {activeTab === 'mine' && (
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-teal)', textTransform: 'uppercase', fontSize: '0.85rem' }}>Strengths:</h4>
              <ul style={{ margin: '0 0 1rem 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {me.strengths?.map((s, i) => <li key={i}>{s}</li>) || <li>Clear articulation.</li>}
              </ul>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-coral)', textTransform: 'uppercase', fontSize: '0.85rem' }}>Improvements:</h4>
              <ul style={{ margin: '0 0 1rem 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {me.improvements?.map((s, i) => <li key={i}>{s}</li>) || <li>Try to minimize pauses.</li>}
              </ul>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                {me.overallFeedback}
              </p>
            </div>
          )}

          {activeTab === 'transcripts' && (
            <div className="battle-transcript-split" style={{ fontSize: '0.85rem' }}>
              <div>
                <span style={{ fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>YOUR TRANSCRIPT</span>
                <p style={{ margin: 0, fontStyle: 'italic', lineHeight: '1.5', color: 'var(--text-secondary)' }}>"{me.transcript}"</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Panel: Rematch / Find New Opponent / Leave */}
        <div className="action-buttons-panel" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {opponentWantsRematch && !rematchRequested && (
            <div style={{ width: '100%', border: '1px dashed #ffffff', padding: '0.75rem', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-teal)', marginBottom: '0.5rem', textAlign: 'center' }}>
              ⚔️ Opponent requested a rematch! Accept below.
            </div>
          )}

          {!rematchRequested ? (
            <button
              onClick={triggerRematch}
              className="btn btn-primary"
              style={{
                flex: 1,
                minWidth: '150px',
                backgroundColor: 'var(--accent-teal)',
                borderColor: 'var(--accent-teal)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 900
              }}
            >
              🔄 REMATCH
            </button>
          ) : (
            <div style={{ border: '2px dashed #ffffff', padding: '0.75rem', flex: 1, textAlign: 'center', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.9rem' }}>
              ⌛ Requesting Rematch...
            </div>
          )}

          <button className="btn btn-secondary" onClick={onNewOpponent} style={{ flex: 1, minWidth: '150px' }}>
            🔍 NEW OPPONENT
          </button>
          <button className="btn btn-secondary" onClick={onLeave} style={{ flex: 1, minWidth: '150px' }}>
            🏠 EXIT BATTLE
          </button>
        </div>

      </div>

      {/* Responsive mobile media queries and keyframes */}
      <style>{`
        @keyframes fall {
          0% { top: -10px; transform: rotate(0deg); }
          100% { top: 600px; transform: rotate(360deg); opacity: 0; }
        }
        @media (max-width: 600px) {
          .score-comparison-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .score-comparison-vs {
            display: none !important;
          }
          .action-buttons-panel {
            flex-direction: column !important;
            align-items: stretch !important;
            width: 100% !important;
          }
          .action-buttons-panel button, .action-buttons-panel div {
            flex: none !important;
            width: 100% !important;
          }
          .battle-transcript-split {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .battle-transcript-split div {
            border-left: none !important;
            padding-left: 0 !important;
            border-top: 1.5px dashed rgba(255,255,255,0.1) !important;
            padding-top: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default BattleResults;
