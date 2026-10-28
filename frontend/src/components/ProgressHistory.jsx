import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronRight, Clock3, Mic, Trash2 } from 'lucide-react';
import FeedbackDashboard from './FeedbackDashboard';
import { BackButton, GameButton, Metric, PageHeading, StatusNotice } from './game/GameUI';

function parseValue(value, fallback) {
  if (typeof value !== 'string') return value ?? fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatAnalysis(session) {
  return {
    ...session,
    categories: parseValue(session.categories, {}),
    fillerWords: parseValue(session.fillerWords, { count: 0, words: [], feedback: '' }),
    anxietyIndicators: parseValue(session.anxietyIndicators, { signs: [], tips: [] }),
    strengths: parseValue(session.strengths, []),
    improvements: parseValue(session.improvements, []),
  };
}

export function ProgressHistory({ history = [], onBack, onClearHistory, onStartPractice, isGuest = false }) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const viewRef = useRef(null);
  useEffect(() => { viewRef.current?.focus({ preventScroll: false }); }, [selectedSession]);
  const sessions = Array.isArray(history) ? history : [];
  const scores = sessions.map((session) => Number(session.overallScore)).filter(Number.isFinite);
  const average = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  const best = scores.length ? Math.max(...scores) : 0;
  const trend = sessions.slice(0, 15).reverse();

  const clearAll = async () => {
    setClearing(true);
    const cleared = await onClearHistory();
    setClearing(false);
    if (cleared !== false) { setConfirmClear(false); setSelectedSession(null); }
  };

  if (selectedSession) return <section className="screen-stack history-detail" ref={viewRef} tabIndex={-1} aria-label="Practice feedback">
    <BackButton onClick={() => setSelectedSession(null)}>All practice sessions</BackButton>
    <FeedbackDashboard topic={{ topic: selectedSession.topic, category: selectedSession.category }} analysis={formatAnalysis(selectedSession)} onPracticeAgain={onStartPractice} onGoHome={() => setSelectedSession(null)} />
  </section>;

  return <section className="screen-stack progress-screen" ref={viewRef} tabIndex={-1} aria-label="Practice history">
    <BackButton onClick={onBack}>Arena</BackButton>
    <PageHeading title="Your progress" description="Small rounds. A stronger voice." action={<GameButton onClick={onStartPractice}>Start training <ArrowRight size={18} /></GameButton>} />
    {isGuest && <StatusNotice>Sign in to save solo practice history to your account. Your battle profile and recent duels are stored in this browser.</StatusNotice>}
    {!sessions.length ? <div className="game-panel empty-state"><Mic size={40} aria-hidden="true" /><h2>Your next round starts here.</h2><p>{isGuest ? 'You can train as a guest. Sign in before your next round if you want to save its feedback.' : 'Complete a training round to see your score and feedback here.'}</p><GameButton onClick={onStartPractice}>Start a practice round <ArrowRight size={18} /></GameButton></div> : <>
      <div className="progress-summary"><Metric value={sessions.length} label="Practice rounds" /><Metric value={average} label="Average score" /><Metric value={best} label="Best score" /></div>
      <section className="game-panel history-trend" aria-labelledby="trend-title">
        <h2 className="section-title" id="trend-title">Recent scores</h2><p>Your last {trend.length} practice rounds, oldest first.</p>
        <ol className="history-chart">{trend.map((session, index) => <li key={session.id || index}><button onClick={() => setSelectedSession(session)} aria-label={formatDate(session.date) + ': ' + session.overallScore + ' out of 100. View ' + session.topic}><span className="chart-score">{session.overallScore}</span><span className="chart-track"><span className="chart-fill" style={{ height: Math.min(100, Math.max(2, Number(session.overallScore) || 0)) + '%' }} /></span><span className="chart-round">{index + 1}</span></button></li>)}</ol>
      </section>
      <section className="history-list" aria-labelledby="history-title"><div className="history-list-heading"><h2 className="section-title" id="history-title">Practice history</h2><GameButton variant="ghost" onClick={() => setConfirmClear(true)}><Trash2 size={16} />Clear history</GameButton></div>
        {confirmClear && <StatusNotice tone="error" action={<div className="game-actions"><GameButton variant="ghost" onClick={() => setConfirmClear(false)} disabled={clearing}>Keep history</GameButton><GameButton variant="danger" onClick={clearAll} disabled={clearing}>{clearing ? 'Clearing…' : 'Clear all sessions'}</GameButton></div>}>Clear all {sessions.length} saved practice sessions? This cannot be undone.</StatusNotice>}
        <ul className="history-rows">{sessions.map((session, index) => <li key={session.id || index}><button className="history-row" onClick={() => setSelectedSession(session)}><span className="history-row-icon"><Mic size={20} /></span><span className="history-row-copy"><strong>{session.topic}</strong><small>{session.category} <span aria-hidden="true">·</span> {formatDate(session.date)} <span aria-hidden="true">·</span> <Clock3 size={12} />{session.duration}s</small></span><span className="history-row-score">{session.overallScore}<small>/100</small></span><ChevronRight size={18} className="history-row-arrow" aria-hidden="true" /></button></li>)}</ul>
      </section>
    </>}
  </section>;
}

export default ProgressHistory;
