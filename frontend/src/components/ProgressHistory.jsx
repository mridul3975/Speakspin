import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Calendar, Clock, BookOpen } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export function ProgressHistory({ history = [], onBack, onClearHistory }) {
  // Aggregate stats
  const totalSessions = history.length;
  
  const avgScore = totalSessions > 0 
    ? Math.round(history.reduce((sum, item) => sum + item.overallScore, 0) / totalSessions) 
    : 0;

  const bestScore = totalSessions > 0 
    ? Math.max(...history.map(item => item.overallScore)) 
    : 0;

  const getScoreColor = (val) => {
    if (val >= 80) return '#4ECDC4';
    if (val >= 60) return '#FFEAA7';
    if (val >= 40) return '#FFA502';
    return '#FF6B6B';
  };

  // Format data for chart (last 20 sessions, chronological order)
  const chartData = [...history]
    .slice(0, 20)
    .reverse()
    .map((item, index) => ({
      name: `S${index + 1}`,
      score: item.overallScore,
      topic: item.topic,
    }));

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="history-header">
        <button className="btn-back-ghost" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <h2 className="history-title">📊 Your Progress</h2>
        {totalSessions > 0 && (
          <button className="btn-clear-history" onClick={handleClear} title="Clear All History">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {totalSessions === 0 ? (
        <div className="history-empty-state">
          <div className="empty-emoji">🎤</div>
          <h3>No sessions yet</h3>
          <p>Start practicing to track your public speaking improvements over time!</p>
          <button className="btn btn-primary" onClick={onBack}>
            Start Practice
          </button>
        </div>
      ) : (
        <>
          {/* Summary Row */}
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-value">{totalSessions}</span>
              <span className="stat-label">Total Sessions</span>
            </div>
            <div className="stat-card">
              <span className="stat-value" style={{ color: getScoreColor(avgScore) }}>{avgScore}</span>
              <span className="stat-label">Average Score</span>
            </div>
            <div className="stat-card">
              <span className="stat-value" style={{ color: getScoreColor(bestScore) }}>{bestScore}</span>
              <span className="stat-label">Best Score</span>
            </div>
          </div>

          {/* Chart Section */}
          <div className="chart-card">
            <h3>Score Trend (Last 20 Sessions)</h3>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#a0a0c0" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#a0a0c0" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a3e',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Session History List */}
          <div className="history-list-section">
            <h3>Session History</h3>
            <div className="history-list">
              {history.map((session) => (
                <div key={session.id} className="history-item-card">
                  {/* Score Indicator */}
                  <div
                    className="history-item-score-circle"
                    style={{ borderColor: getScoreColor(session.overallScore) }}
                  >
                    <span style={{ color: getScoreColor(session.overallScore) }}>{session.overallScore}</span>
                  </div>

                  {/* Info details */}
                  <div className="history-item-details">
                    <h4 className="history-item-topic">"{session.topic}"</h4>
                    
                    <div className="history-item-meta">
                      <span className="meta-tag"><BookOpen size={12} /> {session.category}</span>
                      <span className="meta-tag"><Clock size={12} /> {session.duration}s</span>
                      <span className="meta-tag"><Calendar size={12} /> {formatDate(session.date)}</span>
                    </div>

                    <p className="history-item-excerpt">
                      {session.overallFeedback.length > 120
                        ? `${session.overallFeedback.slice(0, 120)}...`
                        : session.overallFeedback}
                    </p>
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
