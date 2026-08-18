import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TOPIC_BANK } from '../data/topics';

export function SpinWheel({ selectedDuration, onTopicSelected, selectedCategory, onBack }) {
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [wheelTopics, setWheelTopics] = useState([]);
  
  const segments = 10;
  const colors = [
    '#18181b', '#06b6d4', '#27272a', '#d946ef', '#18181b',
    '#0891b2', '#27272a', '#a855f7', '#09090b', '#06b6d4'
  ];

  useEffect(() => {
    const categoryName = selectedCategory || "General";
    const subtopics = TOPIC_BANK[categoryName] || TOPIC_BANK["General"] || [];
    
    // Convert 10 subtopics into segments array structure
    const selected = subtopics.map(topic => ({ category: categoryName, topic }));
    setWheelTopics(selected);
  }, [selectedCategory]);

  useEffect(() => {
    if (wheelTopics.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((rotation * Math.PI) / 180);

    const arcSize = (2 * Math.PI) / segments;

    for (let i = 0; i < segments; i++) {
      const angle = i * arcSize;
      const bgColor = colors[i % colors.length];
      
      ctx.beginPath();
      ctx.fillStyle = bgColor;
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + arcSize);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.save();
      ctx.rotate(angle + arcSize / 2);
      
      const isBright = bgColor === '#06b6d4' || bgColor === '#0891b2' || bgColor === '#d946ef' || bgColor === '#a855f7';
      ctx.fillStyle = isBright ? '#000000' : '#ffffff';
      ctx.font = 'bold 9px Montserrat';
      ctx.textAlign = 'right';
      
      const text = wheelTopics[i].topic;
      const displayName = text.length > 18 ? text.substring(0, 15) + '...' : text;
      
      ctx.fillText(displayName.toUpperCase(), radius - 12, 3);
      ctx.restore();
    }

    ctx.restore();
    ctx.beginPath();
    ctx.fillStyle = '#09090b';
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#06b6d4';
    ctx.arc(center, center, 14, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    ctx.font = '900 7px Montserrat';
    ctx.textAlign = 'center';
    ctx.fillText('SPIN', center, center + 2.5);
  }, [rotation, wheelTopics]);

  const spin = () => {
    if (isSpinning || wheelTopics.length === 0) return;
    setIsSpinning(true);
    setSelectedTopic(null);

    const spinDuration = 4000;
    const startRotation = rotation % 360;
    const additionalSpins = 5 + Math.floor(Math.random() * 5);
    const targetAngle = Math.floor(Math.random() * 360);
    const finalRotation = startRotation + additionalSpins * 360 + targetAngle;

    const startTime = performance.now();

    const animateSpin = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentRot = startRotation + (finalRotation - startRotation) * ease;
      
      setRotation(currentRot);

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        const endAngle = currentRot % 360;
        const normalizedAngle = (360 - (endAngle % 360) + 90) % 360;
        const segmentAngle = 360 / segments;
        const winnerIndex = Math.floor(normalizedAngle / segmentAngle) % segments;

        const winner = wheelTopics[winnerIndex];
        setSelectedTopic(winner);
        setIsSpinning(false);

        setTimeout(() => {
          onTopicSelected(winner);
        }, 2500);
      }
    };

    requestAnimationFrame(animateSpin);
  };

  return (
    <div className="spinning-container" style={{ position: 'relative' }}>
      {!isSpinning && !selectedTopic && onBack && (
        <button 
          className="btn-back-ghost" 
          onClick={onBack}
          style={{ position: 'absolute', top: '0px', left: '0px' }}
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> BACK
        </button>
      )}
      <h2 className="spin-title" style={{ marginTop: (!isSpinning && !selectedTopic && onBack) ? '2.5rem' : '0' }}>🎰 Spin to Decide Your Topic</h2>
      
      <div className="wheel-wrapper">
        <div className="wheel-pointer"></div>
        <canvas
          ref={canvasRef}
          className="wheel-canvas"
          width={254}
          height={254}
          onClick={spin}
          style={{ cursor: isSpinning ? 'default' : 'pointer' }}
        />
      </div>

      {!isSpinning && !selectedTopic && (
        <button className="btn btn-primary" onClick={spin}>
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
          Spin Wheel!
        </button>
      )}

      {selectedTopic && (
        <motion.div
          className="topic-announcement"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <span className="winner-category-tag">{selectedTopic.category}</span>
          <p className="winner-topic-text">"{selectedTopic.topic}"</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginTop: '0.5rem' }}>
            Duration: {selectedDuration}s | Preparing recorder...
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default SpinWheel;
