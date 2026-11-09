import React, { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { translateTopic } from '../../utils/api';

export function TopicReveal({ topic, category, duration, startCountdown, selectedLanguage }) {
  const [translatedTopic, setTranslatedTopic] = useState(topic);
  useEffect(() => {
    let active = true;
    setTranslatedTopic(topic);
    if (selectedLanguage && !selectedLanguage.startsWith('en')) translateTopic(topic, selectedLanguage).then(result => {
      if (active && result?.translated) setTranslatedTopic(result.translated);
    }).catch(() => {});
    return () => { active = false; };
  }, [topic, selectedLanguage]);
  return <section className="battle-scene battle-topic">
    <h1>Your topic is in.</h1>
    <div className="battle-topic-stage"><span className="topic-category">{category}</span><p className="battle-topic-title" dir="auto">{translatedTopic}</p>{translatedTopic !== topic && <p className="battle-small-copy">English: {topic}</p>}<span className="battle-topic-duration"><Clock3 size={17} />{duration} seconds to speak</span></div>
    <div className="battle-count-in"><strong>{startCountdown <= 0 ? 'Speak!' : startCountdown}</strong><span>{startCountdown <= 0 ? 'Your microphone is ready' : 'Your round starts in'}</span></div>
    <p className="battle-small-copy">Take a breath. Choose your opening.</p>
  </section>;
}
export default TopicReveal;
