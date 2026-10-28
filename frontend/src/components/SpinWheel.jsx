import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, RotateCw } from 'lucide-react';
import { TOPIC_BANK } from '../data/topics';
import { getWheelSegment } from '../utils/wheel';
import { BackButton, GameButton, PageHeading } from './game/GameUI';

export function SpinWheel({ selectedDuration, onTopicSelected, selectedCategory = 'General', onBack }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const resultRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const wheelTopics = useMemo(() => {
    const pool = [...(TOPIC_BANK[selectedCategory] || TOPIC_BANK.General || [])];
    for (let index = pool.length - 1; index > 0; index -= 1) {
      const other = Math.floor(Math.random() * (index + 1));
      [pool[index], pool[other]] = [pool[other], pool[index]];
    }
    return pool.slice(0, 10).map(topic => ({ topic, category: selectedCategory }));
  }, [selectedCategory]);
  const selectedTopic = selectedIndex === null ? null : wheelTopics[selectedIndex];

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context || !wheelTopics.length) return;
    const size = 640;
    const center = size / 2;
    const arc = Math.PI * 2 / wheelTopics.length;
    context.clearRect(0, 0, size, size);
    context.save();
    context.translate(center, center);
    context.rotate(rotation * Math.PI / 180);
    wheelTopics.forEach((_, index) => {
      context.beginPath();
      context.moveTo(0, 0);
      context.arc(0, 0, 298, index * arc, (index + 1) * arc);
      context.closePath();
      context.fillStyle = index === selectedIndex ? '#63e8e1' : index % 2 ? '#1c3040' : '#142432';
      context.fill();
      context.strokeStyle = '#0b1018';
      context.lineWidth = 5;
      context.stroke();
      context.save();
      context.rotate((index + 0.5) * arc);
      context.translate(234, 0);
      context.rotate(Math.PI / 2);
      context.fillStyle = index === selectedIndex ? '#0b1018' : '#d9f1f4';
      context.font = '600 38px "Barlow Condensed", sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(String(index + 1).padStart(2, '0'), 0, 0);
      context.restore();
    });
    context.restore();
  }, [rotation, wheelTopics, selectedIndex]);

  useEffect(() => {
    if (selectedTopic) resultRef.current?.focus();
  }, [selectedTopic]);

  const spin = () => {
    if (isSpinning || !wheelTopics.length) return;
    setIsSpinning(true);
    setSelectedIndex(null);
    const start = rotation % 360;
    const end = start + 360 * 5 + Math.random() * 360;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setRotation(end);
      setSelectedIndex(getWheelSegment(end, wheelTopics.length));
      setIsSpinning(false);
      return;
    }
    const startTime = performance.now();
    const animate = now => {
      const progress = Math.min((now - startTime) / 3200, 1);
      setRotation(start + (end - start) * (1 - Math.pow(1 - progress, 4)));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
      else {
        setSelectedIndex(getWheelSegment(end, wheelTopics.length));
        setIsSpinning(false);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
  };

  return (
    <section className="screen-stack wheel-screen">
      {!isSpinning && <BackButton onClick={onBack}>Change challenge</BackButton>}
      <PageHeading title="Let the wheel decide." description={`${selectedCategory} · ${selectedDuration} second round`} />
      <div className="game-panel wheel-layout">
        <div className="topic-wheel">
          <div className="wheel-pointer" aria-hidden="true" />
          <canvas ref={canvasRef} width={640} height={640} className="wheel-canvas" aria-label={`${wheelTopics.length} numbered topic slots. Use the spin button to select a topic.`} role="img" />
          <div className="wheel-hub" aria-hidden="true"><RotateCw size={31} /></div>
        </div>
        <div className="wheel-result">
          {selectedTopic ? <>
            <span className="topic-number">Topic {String(selectedIndex + 1).padStart(2, '0')}</span>
            <h2 ref={resultRef} tabIndex={-1} className="topic-title">{selectedTopic.topic}</h2>
            <p>Take a moment to think. Your microphone check comes next.</p>
            <GameButton onClick={() => onTopicSelected(selectedTopic)}>Take the mic <ArrowRight size={18} /></GameButton>
            <GameButton variant="ghost" onClick={spin}><RotateCw size={16} /> Spin again</GameButton>
          </> : <>
            <h2 className="topic-title">One spin.<br />A fresh challenge.</h2>
            <p>Your topic will appear here in full. The round starts when you’re ready.</p>
            <GameButton onClick={spin} disabled={isSpinning || !wheelTopics.length}><RotateCw size={18} />{isSpinning ? 'Finding your topic…' : 'Spin the wheel'}</GameButton>
          </>}
          <span className="sr-only" role="status">{isSpinning ? 'The wheel is spinning.' : selectedTopic ? `Selected topic: ${selectedTopic.topic}` : ''}</span>
        </div>
      </div>
      <details className="feedback-details"><summary><span>Topics on this wheel</span><ChevronDown size={17} /></summary><ol className="wheel-topic-list">{wheelTopics.map((item, index) => <li key={item.topic} aria-current={index === selectedIndex ? 'true' : undefined}>{item.topic}</li>)}</ol></details>
    </section>
  );
}

export default SpinWheel;
