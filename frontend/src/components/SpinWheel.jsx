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
  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFEAA7', '#FF8E53', '#A062FF',
    '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'
  ];

  // Pick 10 random topics from the categories on mount
  useEffect(() => {
    const allTopics = [];
    Object.keys(TOPIC_BANK).forEach((category) => {
      TOPIC_BANK[category].forEach((topic) => {
        allTopics.push({ category, topic });
      });
    });

    // Shuffle and pick 10
    const shuffled = [...allTopics].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, segments);
    setWheelTopics(selected);
  }, []);

  // Draw the wheel on canvas whenever wheelTopics or rotation changes
  useEffect(() => {
    if (wheelTopics.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;

    ctx.clearRect(0, 0, size, size);

    // Save current context state
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((rotation * Math.PI) / 180);

    const arcSize = (2 * Math.PI) / segments;

    for (let i = 0; i < segments; i++) {
      const angle = i * arcSize;
      
      // Draw slice
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + arcSize);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.strokeStyle = 'rgba(10, 10, 26, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Text
      ctx.save();
      ctx.rotate(angle + arcSize / 2);
      ctx.fillStyle = '#0a0a1a';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'right';
      
      // Truncate topic text to fit wheel slice
      const text = wheelTopics[i].topic;
      const displayName = text.length > 22 ? text.substring(0, 20) + '...' : text;
      
      ctx.fillText(displayName, radius - 15, 4);
      ctx.restore();
    }

    // Draw center circle hub
    ctx.restore();
    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#4ECDC4';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.fillStyle = '#0a0a1a';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('SPIN', center, center + 4);
  }, [rotation, wheelTopics]);

  const spin = () => {
    if (isSpinning || wheelTopics.length === 0) return;
    setIsSpinning(true);
    setSelectedTopic(null);

    const spinDuration = 4000; // 4 seconds
    const startRotation = rotation % 360;
    const additionalSpins = 5 + Math.floor(Math.random() * 5); // 5 to 9 full spins
    const targetAngle = Math.floor(Math.random() * 360);
    const finalRotation = startRotation + additionalSpins * 360 + targetAngle;

    const startTime = performance.now();

    const animateSpin = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      // Cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentRot = startRotation + (finalRotation - startRotation) * ease;
      
      setRotation(currentRot);

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        // Completed spinning
        const endAngle = currentRot % 360;
        
        // Calculate winning index:
        // Angle starts at 0 rad (pointing right) and moves clockwise.
        // The pointer is at top center (270 degrees / -90 degrees).
        // To find the slice under the pointer:
        // normalizedAngle = (360 - endAngle + 90) % 360
        const normalizedAngle = (360 - (endAngle % 360) + 90) % 360;
        const segmentAngle = 360 / segments;
        const winnerIndex = Math.floor(normalizedAngle / segmentAngle) % segments;

        const winner = wheelTopics[winnerIndex];
        setSelectedTopic(winner);
        setIsSpinning(false);

        // Auto-navigate after 2 second delay
        setTimeout(() => {
          onTopicSelected(winner);
        }, 2500);
      }
    };

    requestAnimationFrame(animateSpin);
  };

  return (
    <div className="wheel-container">
      <h2 className="wheel-title">🎰 Spin to Decide Your Topic</h2>
      
      <div className="wheel-wrapper">
        {/* Pointer at the top center */}
        <div className="wheel-pointer">▼</div>
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          onClick={spin}
          style={{ cursor: isSpinning ? 'default' : 'pointer' }}
        />
      </div>

      {!isSpinning && !selectedTopic && (
        <button className="btn btn-primary btn-spin-now" onClick={spin}>
          Spin Wheel!
        </button>
      )}

      {selectedTopic && (
        <motion.div
          className="winner-announcement-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="category-pill">{selectedTopic.category}</span>
          <p className="winner-topic">"{selectedTopic.topic}"</p>
          <p className="winner-duration">You have {selectedDuration}s to speak!</p>
          <div className="preparing-indicator">
            <span className="dot-pulse"></span> Preparing recorder...
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default SpinWheel;
