import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Home, ClipboardList, BarChart3, Heart, Lightbulb, AlertTriangle, CheckCircle2, ChevronRight, Award, Copy, Check } from 'lucide-react';
import ScoreCircle from './ScoreCircle';
import CategoryCard from './CategoryCard';

export function FeedbackDashboard({ topic, analysis, onPracticeAgain, onGoHome }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  const {
    overallScore,
    categories = {},
    fillerWords = { count: 0, words: [], feedback: '' },
    anxietyIndicators = { level: 'low', signs: [], tips: [] },
    strengths = [],
    improvements = [],
    overallFeedback = '',
    challengeForNext = '',
    exemplarSpeech = '',
  } = analysis;

  const tabs = [
    { id: 'overview', label: '📋 Overview', icon: ClipboardList },
    { id: 'details', label: '📊 Details', icon: BarChart3 },
    { id: 'anxiety', label: '🧘 Anxiety', icon: Heart },
    { id: 'tips', label: '💡 Tips', icon: Lightbulb },
    { id: 'exemplar', label: '🏆 Exemplar', icon: Award },
  ];

  const handleCopy = () => {
    if (!exemplarSpeech) return;
    navigator.clipboard.writeText(exemplarSpeech);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format category title
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

  const getScoreColor = (val) => {
    if (val >= 80) return '#4ECDC4';
    if (val >= 60) return '#FFEAA7';
    if (val >= 40) return '#FFA502';
    return '#FF6B6B';
  };

  const getAnxietyBadgeClass = (lvl) => {
    const cleanLvl = String(lvl).toLowerCase();
    if (cleanLvl === 'high') return 'anxiety-badge-high';
    if (cleanLvl === 'moderate') return 'anxiety-badge-moderate';
    return 'anxiety-badge-low';
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <span className="dashboard-label">📊 Your Speech Analysis</span>
        <h2 className="dashboard-topic">Topic: <span className="topic-name-italic">"{topic.topic}"</span></h2>
      </div>

      {/* Main Score Area */}
      <div className="dashboard-score-section">
        <ScoreCircle score={overallScore} size={150} strokeWidth={8} />
      </div>

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`dashboard-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="tab-view-overview"
            >
              {/* Mini Scores Grid (2x4) */}
              <div className="mini-scores-card">
                <h3>Category Breakdown</h3>
                <div className="mini-scores-grid">
                  {Object.entries(categories).map(([key, data]) => (
                    <div key={key} className="mini-score-item">
                      <div
                        className="mini-score-circle"
                        style={{ borderColor: getScoreColor(data.score) }}
                      >
                        <span className="mini-score-val" style={{ color: getScoreColor(data.score) }}>{data.score}</span>
                      </div>
                      <span className="mini-score-label">{getCategoryTitle(key)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Feedback & Filler Words row */}
              <div className="overview-row">
                <div className="overview-feedback-card">
                  <h3>Coach Feedback</h3>
                  <p>{overallFeedback}</p>
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
                    <p className="no-fillers-text">🎉 No filler words detected! Clean speech flow.</p>
                  )}

                  <p className="filler-advice">{fillerWords.feedback}</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="tab-view-details"
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="tab-view-anxiety"
            >
              <div className={`anxiety-level-banner ${getAnxietyBadgeClass(anxietyIndicators.level)}`}>
                <div className="anxiety-badge-header">
                  <Heart size={24} className="heart-icon-badge" />
                  <div>
                    <h4 className="anxiety-badge-title">Anxiety Level</h4>
                    <span className="anxiety-badge-text">{String(anxietyIndicators.level).toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="anxiety-grid">
                <div className="anxiety-list-card">
                  <h3><AlertTriangle size={18} className="text-coral inline-icon" /> Signs Detected</h3>
                  {anxietyIndicators.signs.length > 0 ? (
                    <ul>
                      {anxietyIndicators.signs.map((sign, idx) => (
                        <li key={idx}>{sign}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-list-text">No notable anxiety cues detected. Well controlled!</p>
                  )}
                </div>

                <div className="anxiety-list-card">
                  <h3><CheckCircle2 size={18} className="text-teal inline-icon" /> Calm Down Tips</h3>
                  <ul>
                    {anxietyIndicators.tips.map((tip, idx) => (
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="tab-view-tips"
            >
              <div className="tips-row">
                <div className="tips-card card-strengths">
                  <h3>💪 Your Strengths</h3>
                  <ul>
                    {strengths.map((str, idx) => (
                      <li key={idx}>✓ {str}</li>
                    ))}
                  </ul>
                </div>

                <div className="tips-card card-improvements">
                  <h3>📈 Areas to Improve</h3>
                  <ul>
                    {improvements.map((imp, idx) => (
                      <li key={idx}>🎯 {imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="challenge-gradient-card">
                <div className="challenge-header">
                  <span className="challenge-trophy">🏆</span>
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="tab-view-exemplar"
            >
              <div className="exemplar-card">
                <div className="exemplar-card-header">
                  <h3>🏆 Perfect 100/100 Speech</h3>
                  <button className="btn btn-secondary btn-copy-exemplar" onClick={handleCopy}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? 'Copied!' : 'Copy Speech'}</span>
                  </button>
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
      <div className="dashboard-actions">
        <motion.button
          className="btn btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPracticeAgain}
        >
          <RefreshCw size={18} /> Practice Again
        </motion.button>

        <motion.button
          className="btn btn-secondary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGoHome}
        >
          <Home size={18} /> Home
        </motion.button>
      </div>
    </div>
  );
}

export default FeedbackDashboard;
