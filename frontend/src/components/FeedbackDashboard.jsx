import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Copy, Home, RotateCcw, Target } from 'lucide-react';
import ScoreCircle from './ScoreCircle';
import CategoryCard from './CategoryCard';
import { translateTopic } from '../utils/api';
import { GameButton, StatusNotice } from './game/GameUI';

const asList = value => Array.isArray(value) ? value.filter(item => typeof item === 'string' && item.trim()) : typeof value === 'string' && value.trim() ? [value] : [];

export function FeedbackDashboard({ topic, analysis, onPracticeAgain, onGoHome, selectedLanguage }) {
  const [translatedTopic, setTranslatedTopic] = useState(topic?.topic || '');
  const [copyState, setCopyState] = useState('');
  const copyTimeoutRef = useRef(null);
  useEffect(() => () => clearTimeout(copyTimeoutRef.current), []);
  useEffect(() => {
    let active = true;
    setTranslatedTopic(topic?.topic || '');
    if (topic?.topic && selectedLanguage && !selectedLanguage.startsWith('en')) {
      translateTopic(topic.topic, selectedLanguage).then(result => {
        if (active && result?.translated) setTranslatedTopic(result.translated);
      }).catch(() => {});
    }
    return () => { active = false; };
  }, [topic?.topic, selectedLanguage]);

  const data = analysis && typeof analysis === 'object' ? analysis : {};
  const categories = data.categories && typeof data.categories === 'object' ? Object.entries(data.categories).filter(([, item]) => item && typeof item === 'object') : [];
  const strengths = asList(data.strengths);
  const improvements = asList(data.improvements);
  const filler = data.fillerWords && typeof data.fillerWords === 'object' ? data.fillerWords : {};
  const signs = asList(data.anxietyIndicators?.signs);
  const deliveryTips = asList(data.anxietyIndicators?.tips);
  const example = typeof data.exemplarSpeech === 'string' ? data.exemplarSpeech : '';
  const hasScore = typeof data.overallScore === 'number' && Number.isFinite(data.overallScore);
  const copyExample = async () => {
    try {
      await navigator.clipboard.writeText(example);
      setCopyState('copied');
    } catch { setCopyState('error'); }
    clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopyState(''), 2500);
  };
  const disclosure = (title, children) => <details className="feedback-details"><summary><span>{title}</span><ChevronDown size={17} /></summary>{children}</details>;

  return <section className="screen-stack solo-results">
    <div className="game-panel result-hero">
      <ScoreCircle score={data.overallScore} size={164} strokeWidth={7} />
      <div className="result-summary">
        <h1>{hasScore ? 'Round complete.' : 'Your round review.'}</h1>
        <p className="result-topic" dir="auto">{translatedTopic}</p>
        {data.overallFeedback && <p>{data.overallFeedback}</p>}
        <div className="game-actions">
          {onPracticeAgain && <GameButton onClick={onPracticeAgain}><RotateCcw size={17} />Play another round</GameButton>}
          {onGoHome && <GameButton variant="secondary" onClick={onGoHome}><Home size={17} />Back to lobby</GameButton>}
        </div>
      </div>
    </div>
    {data.challengeForNext && <div className="next-challenge"><Target size={24} /><div><h2>Your next challenge</h2><p>{data.challengeForNext}</p></div>{onPracticeAgain && <GameButton variant="ghost" onClick={onPracticeAgain} aria-label="Practice your next challenge"><ArrowRight size={20} /></GameButton>}</div>}
    {categories.length > 0 && disclosure('Skill breakdown', <div className="category-score-list">{categories.map(([key, item]) => <CategoryCard key={key} categoryKey={key} score={item.score} feedback={item.feedback} />)}</div>)}
    {(strengths.length > 0 || improvements.length > 0) && disclosure('What worked & what to try', <div className="feedback-columns">
      {strengths.length > 0 && <div><h3 className="section-title">What worked</h3><ul className="feedback-list">{strengths.map((text, index) => <li key={index}>{text}</li>)}</ul></div>}
      {improvements.length > 0 && <div><h3 className="section-title">Try next time</h3><ul className="feedback-list">{improvements.map((text, index) => <li key={index}>{text}</li>)}</ul></div>}
    </div>)}
    {(typeof filler.count === 'number' || signs.length > 0 || deliveryTips.length > 0) && disclosure('Filler words & delivery observations', <div className="feedback-columns">
      <div><h3 className="section-title">Filler words</h3>{typeof filler.count === 'number' && <p><strong>{filler.count}</strong> detected in your transcript</p>}{Array.isArray(filler.words) && filler.words.length > 0 && <div className="filler-tags-list">{filler.words.map((word, index) => <span key={index} className="filler-tag">{typeof word === 'string' ? word : word?.word || ''}</span>)}</div>}{filler.feedback && <p>{filler.feedback}</p>}</div>
      {(signs.length > 0 || deliveryTips.length > 0) && <div><h3 className="section-title">Delivery observations</h3><p className="feedback-note">Based on your words and timing. Tone of voice is not measured.</p><ul className="feedback-list">{[...signs, ...deliveryTips].map((text, index) => <li key={index}>{text}</li>)}</ul></div>}
    </div>)}
    {example && disclosure('Example response', <div className="example-speech"><GameButton variant="secondary" onClick={copyExample}>{copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}{copyState === 'copied' ? 'Copied' : 'Copy example'}</GameButton>{copyState === 'error' && <StatusNotice tone="error">Copying is unavailable. You can select the example text to copy it.</StatusNotice>}<p dir="auto">{example}</p></div>)}
    {!hasScore && <StatusNotice>Some scoring details are unavailable for this round. You can review any feedback above or start another round.</StatusNotice>}
  </section>;
}

export default FeedbackDashboard;
