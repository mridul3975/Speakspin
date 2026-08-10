import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TOPIC_BANK } from '../data/topics';

export function SpinWheel({ selectedDuration, onTopicSelected }) {
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [wheelTopics, setWheelTopics] = useState([]);
  
  const segments = 10;
  // High-contrast alternating monochrome color palette
  const colors = [
    '#000000', '#ffffff', '#eeeeee', '#000000', '#ffffff',
    '#dadada', '#000000', '#ffffff', '#f5f3f3', '#000000'
  ];

  // Pick 10 random topics from the categories on mount
  useEffect(() => {
    const allTopics = [];
    Object.keys(TOPIC_BANK).forEach((category) => {
      TOPIC_BANK[category].forEach((topic) => {
        allTopics.push({ category, topic });
      });
    });

    const shuffled = [...allTopics].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, segments);
    setWheelTopics(selected);
  }, []);

  // Draw the wheel on canvas
  useEffect(() => {
    if (wheelTopics.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((rotation * Math.PI) / 180);

    const arcSize = (2 * Math.PI) / segments;

    for (let i = 0; i < segments; i++) {
      const angle = i * arcSize;
      const bgColor = colors[i % colors.length];
      
      // Draw slice
      ctx.beginPath();
      ctx.fillStyle = bgColor;
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + arcSize);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Text
      ctx.save();
      ctx.rotate(angle + arcSize / 2);
      
      // Dynamic text color (white on black, black on white/grey)
      ctx.fillStyle = bgColor === '#000000' ? '#ffffff' : '#000000';
      ctx.font = 'bold 11px Montserrat';
      ctx.textAlign = 'right';
      
      const text = wheelTopics[i].topic;
      const displayName = text.length > 22 ? text.substring(0, 19) + '...' : text;
      
      ctx.fillText(displayName.toUpperCase(), radius - 15, 4);
      ctx.restore();
    }

    // Draw center circle hub
    ctx.restore();
    ctx.beginPath();
    ctx.fillStyle = '#000000';
    ctx.arc(center, center, 24, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    ctx.font = '900 9px Montserrat';
    ctx.textAlign = 'center';
    ctx.fillText('SPIN', center, center + 3);
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
    <div className="spinning-container">
      <h2 className="spin-title">🎰 Spin to Decide Your Topic</h2>
      
      <div className="wheel-wrapper">
        <div className="wheel-pointer"></div>
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
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
