import { useEffect, useRef } from 'react';

export function useAudioManager() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let isPlaying = false;

    const initAudio = () => {
      if (audioCtxRef.current) return;
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      // Create a gentle brown noise for cafe ambiance
      const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // (roughly) compensate for gain
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400; // Muffled chatter/hum
      filterNodeRef.current = filter;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0; // Start silent
      gainNodeRef.current = gainNode;

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start();
      isPlaying = true;
    };

    const updateAudio = () => {
      if (gainNodeRef.current && filterNodeRef.current && audioCtxRef.current) {
        // Map scroll percentage to audio parameters
        const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        const clampedScroll = Math.max(0, Math.min(1, scrollPercent));
        
        // Volume fades in then slightly out
        const volume = Math.sin(clampedScroll * Math.PI) * 0.15;
        // Filter frequency increases as you scroll down
        const frequency = 400 + (clampedScroll * 1000);
        
        gainNodeRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.1);
        filterNodeRef.current.frequency.setTargetAtTime(frequency, audioCtxRef.current.currentTime, 0.1);
      }
      animationFrameId = requestAnimationFrame(updateAudio);
    };

    // Browsers require user interaction to start audio context
    const handleInteraction = () => {
      initAudio();
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    
    animationFrameId = requestAnimationFrame(updateAudio);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      cancelAnimationFrame(animationFrameId);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);
}
