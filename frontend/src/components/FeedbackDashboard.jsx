import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScoreCircle from './ScoreCircle';
import CategoryCard from './CategoryCard';
import { translateTopic } from '../utils/api';
import { Button } from "@/components/ui/button";

export function FeedbackDashboard({ topic, analysis, onPracticeAgain, onGoHome, selectedLanguage }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [translatedTopic, setTranslatedTopic] = useState(topic?.topic || '');

  useEffect(() => {
    let active = true;
    if (topic?.topic) {
      if (selectedLanguage && !selectedLanguage.startsWith('en')) {
        translateTopic(topic.topic, selectedLanguage).then((res) => {
          if (active && res && res.translated) {
            setTranslatedTopic(res.translated);
          }
        });
      } else {
        setTranslatedTopic(topic.topic);
      }
    }
    return () => {
      active = false;
    };
  }, [topic, selectedLanguage]);

  const {
    overallScore = 0,
    categories = {},
    fillerWords = { count: 0, words: [], feedback: '' },
    anxietyIndicators = { level: 'low', signs: [], tips: [] },
    strengths = [],
    improvements = [],
    overallFeedback = '',
    challengeForNext = '',
    exemplarSpeech = '',
  } = analysis || {};

  const safeAnxiety = (anxietyIndicators && typeof anxietyIndicators === 'object') ? anxietyIndicators : { level: 'low', signs: [], tips: [] };
  
  let safeSigns = [];
  if (Array.isArray(safeAnxiety.signs)) {
    safeSigns = safeAnxiety.signs;
  } else if (typeof safeAnxiety.signs === 'string') {
    safeSigns = [safeAnxiety.signs];
  }
  
  let safeTips = [];
  if (Array.isArray(safeAnxiety.tips)) {
    safeTips = safeAnxiety.tips;
  } else if (typeof safeAnxiety.tips === 'string') {
    safeTips = [safeAnxiety.tips];
  }
  
  const safeLevel = safeAnxiety.level || 'low';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'summarize' },
    { id: 'details', label: 'Details', icon: 'bar_chart' },
    { id: 'anxiety', label: 'Anxiety', icon: 'heart_broken' },
    { id: 'tips', label: 'Tips', icon: 'emoji_objects' },
    { id: 'exemplar', label: 'Exemplar', icon: 'emoji_events' },
  ];

  const handleCopy = () => {
    if (!exemplarSpeech) return;
    navigator.clipboard.writeText(exemplarSpeech);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryTitle = (key) => {
    switch (key) {
      case 'confidence': return 'Confidence';
      case 'fluency': return 'Fluency';
      case 'relevance': return 'Relevance';
      case 'vocabulary': return 'Vocabulary';
      case 'structure': return 'Structure';
      case 'clarity': return 'Clarity';
      case 'engagement': return 'Engagement';
      case 'timeManagement': return 'Time Mgmt';
      default: return key;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {onGoHome && (
          <Button 
            variant="ghost" 
            onClick={onGoHome}
            className="text-white hover:text-white hover:bg-[#1a1a1a] rounded-none px-2 font-black mb-3 -ml-2"
          >
            <span className="material-symbols-outlined text-sm mr-1">arrow_back</span> BACK
          </Button>
        )}
        <span className="dashboard-label">YOUR SPEECH ANALYSIS</span>
        <h2 className="dashboard-topic" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
          <span>TOPIC: <span style={{ fontStyle: 'italic' }}>{translatedTopic === topic.topic ? `"${topic.topic}"` : `"${translatedTopic}"`}</span></span>
          {translatedTopic !== topic.topic && (
            <span style={{ fontSize: '0.85rem', fontWeight: 'normal', opacity: 0.6, fontStyle: 'italic' }}>
              (English: "{topic.topic}")
            </span>
          )}
        </h2>
      </div>

      {/* Main Score Area */}
      <div className="dashboard-score-section">
        <ScoreCircle score={overallScore} size={150} strokeWidth={8} />
      </div>

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`dashboard-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panel */}
      <div className="dashboard-content-panel">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="tab-view-overview"
            >
              {/* Category Breakdown */}
              <div className="mini-scores-card">
                <h3>Category Breakdown</h3>
                <div className="mini-scores-grid">
                  {Object.entries(categories).map(([key, data]) => (
                    <div key={key} className="mini-score-item">
                      <div className="mini-score-circle">
                        <span className="mini-score-val">{data.score}</span>
                      </div>
                      <span className="mini-score-label">{getCategoryTitle(key)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Feedback & Filler Words */}
              <div className="overview-row">
                <div className="overview-feedback-card">
                  <h3>Coach Feedback</h3>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{overallFeedback}</p>
                </div>

                <div className="filler-words-card">
                  <h3>Filler Words</h3>
                  <div className="filler-header-row">
                    <span className="filler-count">{fillerWords.count}</span>
                    <span className="filler-sub">detected filler words</span>
                  </div>
                  
                  {fillerWords.words.length > 0 ? (
                    <div className="filler-tags-list">
                      {fillerWords.words.map((w, i) => (
                        <span key={i} className="filler-tag">{w}</span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontStyle: 'italic', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      🎉 No filler words detected! Clean speech flow.
                    </p>
                  )}

                  <p className="filler-advice">{fillerWords.feedback}</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="details-grid">
                {Object.entries(categories).map(([key, data]) => (
                  <CategoryCard
                    key={key}
                    categoryKey={key}
                    score={data.score}
                    feedback={data.feedback}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'anxiety' && (
            <motion.div
              key="anxiety"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="anxiety-level-banner">
                <div className="anxiety-badge-header">
                  <span className="material-symbols-outlined text-3xl">heart_broken</span>
                  <div>
                    <h4 className="anxiety-badge-title">Anxiety Level</h4>
                    <span className="anxiety-badge-text">{String(safeLevel).toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="anxiety-grid">
                <div className="anxiety-list-card">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined">warning</span> Signs Detected
                  </h3>
                  {safeSigns.length > 0 ? (
                    <ul>
                      {safeSigns.map((sign, idx) => (
                        <li key={idx}>{sign}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>No notable anxiety cues detected. Well controlled!</p>
                  )}
                </div>

                <div className="anxiety-list-card">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined">check_circle</span> Calm Down Tips
                  </h3>
                  <ul>
                    {safeTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tips' && (
            <motion.div
              key="tips"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="tips-row">
                <div className="tips-card">
                  <h3>💪 Your Strengths</h3>
                  <ul>
                    {strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="tips-card">
                  <h3>📈 Areas to Improve</h3>
                  <ul>
                    {improvements.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="challenge-gradient-card">
                <div className="challenge-header">
                  <span className="material-symbols-outlined text-3xl">emoji_events</span>
                  <div>
                    <h4>Next Session Challenge</h4>
                    <p className="challenge-content">{challengeForNext}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'exemplar' && (
            <motion.div
              key="exemplar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="exemplar-card">
                <div className="exemplar-card-header">
                  <h3>🏆 Perfect 100/100 Speech</h3>
                  <Button variant="outline" className="bg-transparent hover:bg-[#111111] text-[#888888] font-black uppercase tracking-widest rounded-none border-2 border-[#333333] h-10 px-4" onClick={handleCopy}>
                    <span className="material-symbols-outlined text-sm mr-2">{copied ? 'check' : 'content_copy'}</span>
                    <span>{copied ? 'Copied!' : 'Copy Speech'}</span>
                  </Button>
                </div>
                <div className="exemplar-text-container">
                  <p className="exemplar-text">
                    {exemplarSpeech || 'Exemplar speech is not available for this session.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
        <Button onClick={onPracticeAgain} className="bg-white hover:bg-[#e0e0e0] text-black font-black uppercase tracking-widest rounded-none border-2 border-white px-6 h-12">
          <span className="material-symbols-outlined text-sm mr-2">replay</span> Practice Again
        </Button>

        <Button variant="outline" onClick={onGoHome} className="bg-transparent hover:bg-[#111111] text-[#888888] font-black uppercase tracking-widest rounded-none border-2 border-[#333333] px-6 h-12">
          <span className="material-symbols-outlined text-sm mr-2">home</span> Home
        </Button>
      </div>
    </div>
  );
}

export default FeedbackDashboard;
