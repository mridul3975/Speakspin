import { useState, useEffect, useRef } from 'react';

export function useAudioLevel(isActive, customStream = null) {
  const [audioLevels, setAudioLevels] = useState(new Array(20).fill(0));
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      cleanup();
      return;
    }

    async function initAudio() {
      try {
        const stream = customStream || (await navigator.mediaDevices.getUserMedia({ audio: true }));
        streamRef.current = stream;

        // Initialize Web Audio API
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64; // Small fft for 32 bin values
        analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateLevel = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Map 32 bins to 20 visualizer bars
          const nextLevels = [];
          const step = Math.floor(bufferLength / 20) || 1;
          for (let i = 0; i < 20; i++) {
            const index = Math.min(i * step, bufferLength - 1);
            // Normalize level between 0 and 1
            const val = dataArray[index] / 255;
            nextLevels.push(val);
          }
          setAudioLevels(nextLevels);
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (err) {
        console.warn('Audio level visualizer note:', err.message);
      }
    }

    initAudio();

    return () => {
      cleanup();
    };
  }, [isActive, customStream]);

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(e => console.error(e));
      audioContextRef.current = null;
    }
    // Only stop tracks if this hook opened the stream itself
    if (streamRef.current && !customStream) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setAudioLevels(new Array(20).fill(0));
  };

  return { audioLevels, stream: streamRef.current };
}
