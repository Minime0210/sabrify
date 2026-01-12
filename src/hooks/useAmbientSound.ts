import { useState, useEffect, useRef, useCallback } from 'react';

export type AmbientSoundType = 'rain' | 'wind' | 'masjid' | 'none';

interface AudioNodes {
  context: AudioContext;
  gainNode: GainNode;
  sources: AudioBufferSourceNode[];
}

/**
 * Generate white noise buffer for rain/wind base
 */
const createNoiseBuffer = (context: AudioContext, duration: number): AudioBuffer => {
  const bufferSize = context.sampleRate * duration;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  return buffer;
};

/**
 * Create rain sound using filtered white noise with random droplets
 */
const createRainSound = (context: AudioContext, masterGain: GainNode): AudioBufferSourceNode[] => {
  const sources: AudioBufferSourceNode[] = [];
  
  // Base rain noise
  const noiseBuffer = createNoiseBuffer(context, 2);
  const noiseSource = context.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;
  
  // Bandpass filter for rain-like sound
  const bandpass = context.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 1000;
  bandpass.Q.value = 0.5;
  
  // Highpass to remove rumble
  const highpass = context.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 400;
  
  // Gain for rain volume
  const rainGain = context.createGain();
  rainGain.gain.value = 0.15;
  
  noiseSource.connect(bandpass);
  bandpass.connect(highpass);
  highpass.connect(rainGain);
  rainGain.connect(masterGain);
  
  noiseSource.start();
  sources.push(noiseSource);
  
  // Add gentle thunder rumbles occasionally using oscillator
  const createThunderRumble = () => {
    const osc = context.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 40 + Math.random() * 20;
    
    const thunderGain = context.createGain();
    thunderGain.gain.setValueAtTime(0, context.currentTime);
    thunderGain.gain.linearRampToValueAtTime(0.03, context.currentTime + 0.5);
    thunderGain.gain.linearRampToValueAtTime(0, context.currentTime + 3);
    
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 100;
    
    osc.connect(filter);
    filter.connect(thunderGain);
    thunderGain.connect(masterGain);
    
    osc.start();
    osc.stop(context.currentTime + 3);
  };
  
  // Schedule occasional thunder
  const thunderInterval = setInterval(() => {
    if (Math.random() < 0.3) {
      createThunderRumble();
    }
  }, 8000);
  
  // Store interval for cleanup
  (noiseSource as any)._thunderInterval = thunderInterval;
  
  return sources;
};

/**
 * Create wind sound using modulated filtered noise
 */
const createWindSound = (context: AudioContext, masterGain: GainNode): AudioBufferSourceNode[] => {
  const sources: AudioBufferSourceNode[] = [];
  
  const noiseBuffer = createNoiseBuffer(context, 2);
  const noiseSource = context.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;
  
  // Lowpass filter for wind whoosh
  const lowpass = context.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 800;
  lowpass.Q.value = 1;
  
  // LFO for wind modulation
  const lfo = context.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.1;
  
  const lfoGain = context.createGain();
  lfoGain.gain.value = 300;
  
  lfo.connect(lfoGain);
  lfoGain.connect(lowpass.frequency);
  
  // Main gain
  const windGain = context.createGain();
  windGain.gain.value = 0.12;
  
  noiseSource.connect(lowpass);
  lowpass.connect(windGain);
  windGain.connect(masterGain);
  
  noiseSource.start();
  lfo.start();
  sources.push(noiseSource);
  
  // Store LFO for cleanup
  (noiseSource as any)._lfo = lfo;
  
  return sources;
};

/**
 * Create masjid ambience - gentle reverberant tones
 */
const createMasjidSound = (context: AudioContext, masterGain: GainNode): AudioBufferSourceNode[] => {
  const sources: AudioBufferSourceNode[] = [];
  
  // Create gentle drone notes (harmonic series)
  const frequencies = [110, 165, 220, 330]; // A2, E3, A3, E4
  
  frequencies.forEach((freq, index) => {
    const osc = context.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    // Very gentle volume, quieter for higher notes
    const oscGain = context.createGain();
    oscGain.gain.value = 0.02 / (index + 1);
    
    // Slow tremolo
    const tremolo = context.createOscillator();
    tremolo.type = 'sine';
    tremolo.frequency.value = 0.05 + Math.random() * 0.1;
    
    const tremoloGain = context.createGain();
    tremoloGain.gain.value = 0.005;
    
    tremolo.connect(tremoloGain);
    tremoloGain.connect(oscGain.gain);
    
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    
    osc.start();
    tremolo.start();
    
    // Store for cleanup
    (osc as any)._tremolo = tremolo;
    sources.push(osc as any);
  });
  
  // Add subtle filtered noise for room ambience
  const noiseBuffer = createNoiseBuffer(context, 2);
  const noiseSource = context.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;
  
  const lowpass = context.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 200;
  
  const noiseGain = context.createGain();
  noiseGain.gain.value = 0.02;
  
  noiseSource.connect(lowpass);
  lowpass.connect(noiseGain);
  noiseGain.connect(masterGain);
  
  noiseSource.start();
  sources.push(noiseSource);
  
  return sources;
};

export const useAmbientSound = () => {
  const [soundType, setSoundType] = useState<AmbientSoundType>('none');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<AudioNodes | null>(null);

  const stopSound = useCallback(() => {
    if (audioRef.current) {
      const { sources, context, gainNode } = audioRef.current;
      
      // Fade out
      gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.5);
      
      setTimeout(() => {
        sources.forEach(source => {
          try {
            // Cleanup any attached nodes
            if ((source as any)._lfo) {
              (source as any)._lfo.stop();
            }
            if ((source as any)._tremolo) {
              (source as any)._tremolo.stop();
            }
            if ((source as any)._thunderInterval) {
              clearInterval((source as any)._thunderInterval);
            }
            source.stop();
          } catch (e) {
            // Source might already be stopped
          }
        });
        context.close();
        audioRef.current = null;
      }, 600);
    }
    setIsPlaying(false);
  }, []);

  const playSound = useCallback((type: AmbientSoundType) => {
    // Stop any existing sound
    if (audioRef.current) {
      stopSound();
      // Small delay before starting new sound
      setTimeout(() => {
        if (type !== 'none') {
          startNewSound(type);
        }
      }, 700);
    } else if (type !== 'none') {
      startNewSound(type);
    }
    
    setSoundType(type);
  }, [stopSound]);

  const startNewSound = (type: AmbientSoundType) => {
    const context = new AudioContext();
    const gainNode = context.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(context.destination);
    
    let sources: AudioBufferSourceNode[] = [];
    
    switch (type) {
      case 'rain':
        sources = createRainSound(context, gainNode);
        break;
      case 'wind':
        sources = createWindSound(context, gainNode);
        break;
      case 'masjid':
        sources = createMasjidSound(context, gainNode);
        break;
    }
    
    // Fade in
    gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 1);
    
    audioRef.current = { context, gainNode, sources };
    setIsPlaying(true);
  };

  const updateVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.gainNode.gain.linearRampToValueAtTime(
        newVolume,
        audioRef.current.context.currentTime + 0.1
      );
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        const { sources, context } = audioRef.current;
        sources.forEach(source => {
          try {
            if ((source as any)._lfo) (source as any)._lfo.stop();
            if ((source as any)._tremolo) (source as any)._tremolo.stop();
            if ((source as any)._thunderInterval) clearInterval((source as any)._thunderInterval);
            source.stop();
          } catch (e) {}
        });
        context.close();
      }
    };
  }, []);

  return {
    soundType,
    isPlaying,
    volume,
    playSound,
    stopSound,
    updateVolume,
  };
};
