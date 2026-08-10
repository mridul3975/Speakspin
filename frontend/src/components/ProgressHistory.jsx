import React from 'react';
import { motion } from 'framer-motion';

export function ProgressHistory({ history = [], onBack, onClearHistory }) {
  const totalSessions = history.length;
  
  const avgScore = totalSessions > 0 
    ? Math.round(history.reduce((sum, item) => sum + item.overallScore, 0) / totalSessions) 
    : 0;

  const bestScore = totalSessions > 0 
    ? Math.max(...history.map(item => item.overallScore)) 
    : 0;

  const chartData = [...history]
    .slice(0, 15)
    .reverse();

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your speech history? This cannot be undone.')) {
      onClearHistory();
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <motion.div
      className="history-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="history-header">
        <button className="btn-back-ghost" onClick={onBack}>
          <span className="material-symbols-outlined text-sm">arrow_back</span> BACK
        </button>
        <h2 className="history-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined text-3xl">trending_up</span> YOUR PROGRESS
        </h2>
        {totalSessions > 0 && (
          <button 
            className="btn btn-secondary" 
            onClick={handleClear} 
            title="Clear All History"
            style={{ padding: '0.5rem 1rem', borderColor: 'var(--accent-coral)' }}
          >
            <span className="material-symbols-outlined text-sm" style={{ color: 'var(--accent-coral)' }}>delete</span>
          </button>
        )}
      </div>

      {totalSessions === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed #000000' }}>
          <span className="material-symbols-outlined text-5xl mb-4">mic_off</span>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>No sessions yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Start practicing to track your public speaking improvements over time!</p>
          <button className="btn btn-primary" onClick={onBack}>
            START PRACTICE
          </button>
        </div>
      ) : (
        <>
          {/* Summary Row */}
          <div className="stats-cards-row">
            <div className="stat-item-card">
              <div className="stat-val-huge">{totalSessions}</div>
              <div className="stat-label-caps">Total Sessions</div>
            </div>
            <div className="stat-item-card">
              <div className="stat-val-huge">{avgScore}</div>
              <div className="stat-label-caps">Average Score</div>
            </div>
            <div className="stat-item-card">
              <div className="stat-val-huge">{bestScore}</div>
              <div className="stat-label-caps">Best Score</div>
            </div>
          </div>

          {/* Custom Outlined Chart Section */}
          <div className="trend-card-outlined" style={{ textAlign: 'center' }}>
            <h3>SCORE TREND (LAST 15 SESSIONS)</h3>
            <div className="custom-brutalist-chart">
              {chartData.map((session, index) => {
                const heightPercent = `${Math.max(4, session.overallScore)}%`;
                return (
                  <div
                    key={session.id || index}
                    className="chart-bar-column"
                    style={{ height: heightPercent }}
                  >
                    <div className="chart-bar-tooltip">
                      Score: {session.overallScore} | "{session.topic}"
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
              <span>Oldest</span>
              <span>Newest</span>
            </div>
          </div>

          {/* Session History List */}
          <div className="history-list-card">
            <h3 style={{ textAlign: 'center' }}>SESSION HISTORY</h3>
            <div className="history-items-stack">
              {history.map((session) => (
                <div key={session.id} className="history-item-card">
                  <div className="history-item-info">
                    <h4 className="history-item-topic">"{session.topic}"</h4>
                    <div className="history-item-meta" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontWeight: 700, textTransform: 'uppercase' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <span className="material-symbols-outlined text-xs">book</span> {session.category}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <span className="material-symbols-outlined text-xs">schedule</span> {session.duration}S
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <span className="material-symbols-outlined text-xs">calendar_today</span> {formatDate(session.date)}
                      </span>
                    </div>
                  </div>

                  <div className="history-item-score-block">
                    <div className="history-item-score-box">
                      {session.overallScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default ProgressHistory;
