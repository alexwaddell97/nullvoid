import { useEffect, useRef, useCallback } from 'react';
import { Howl, Howler } from 'howler';

interface SoundConfig {
  src: string;
  volume?: number;
  loop?: boolean;
  sprite?: { [key: string]: [number, number] }; // For sound sprites
}

interface SoundLibrary {
  // Boot sequence sounds
  logoJingle: SoundConfig;
  crtPowerOn: SoundConfig;
  crtPowerOnLoop: SoundConfig;
  crtHumStart: SoundConfig;
  crtHumLoop: SoundConfig;
  staticBurst: SoundConfig;
  bootBeep: SoundConfig;
  
  // Ambient sounds
  serverAmbience: SoundConfig;
  electricalHum: SoundConfig;
  distantFan: SoundConfig;
  
  // UI sounds
  keyPress: SoundConfig;
  fileOpen: SoundConfig;
  fileClose: SoundConfig;
  windowOpen: SoundConfig;
  windowClose: SoundConfig;
  buttonClick: SoundConfig;
  appHover: SoundConfig;
  
  // System sounds
  errorBeep: SoundConfig;
  successChime: SoundConfig;
  warningBeep: SoundConfig;
  decryptProcessing: SoundConfig;
  dataStream: SoundConfig;
  
  // Terminal sounds
  terminalType: SoundConfig;
  terminalEnter: SoundConfig;
}

// Define your sound library here
// Replace these paths with your actual sound files in /public/sounds/
const soundLibrary: SoundLibrary = {
  // Boot sequence
  logoJingle: { src: './sounds/logo-jingle.mp3', volume: 0.5 },
  crtPowerOn: { src: './sounds/crt-power-on.mp3', volume: 0.7 },
  crtPowerOnLoop: { src: './sounds/crt-power-on-loop.mp3', volume: 0.7, loop: true },
  crtHumStart: { src: './sounds/crt-hum-start.mp3', volume: 0.1, loop: true },
  crtHumLoop: { src: './sounds/crt-hum-loop.mp3', volume: 0.1, loop: true },
  staticBurst: { src: './sounds/static-burst.mp3', volume: 0.5 },
  bootBeep: { src: './sounds/boot-beep.mp3', volume: 0.6 },
  
  // Ambient
  serverAmbience: { src: './sounds/server-ambience.mp3', volume: 0.2, loop: true },
  electricalHum: { src: './sounds/electrical-hum.mp3', volume: 0.15, loop: true },
  distantFan: { src: './sounds/distant-fan.mp3', volume: 0.1, loop: true },
  
  // UI
  keyPress: { src: './sounds/key-press.mp3', volume: 0.3 },
  fileOpen: { src: './sounds/file-open.mp3', volume: 0.4 },
  fileClose: { src: './sounds/file-close.mp3', volume: 0.4 },
  windowOpen: { src: './sounds/window-open.mp3', volume: 0.5 },
  windowClose: { src: './sounds/window-close.mp3', volume: 0.5 },
  buttonClick: { src: './sounds/button-click.mp3', volume: 0.35 },
  appHover: { src: './sounds/app-hover.mp3', volume: 0.25 },
  
  // System
  errorBeep: { src: './sounds/error-beep.mp3', volume: 0.6 },
  successChime: { src: './sounds/success-chime.mp3', volume: 0.5 },
  warningBeep: { src: './sounds/warning-beep.mp3', volume: 0.55 },
  decryptProcessing: { src: './sounds/decrypt-processing.mp3', volume: 0.4, loop: true },
  dataStream: { src: './sounds/data-stream.mp3', volume: 0.3 },
  
  // Terminal
  terminalType: { src: './sounds/terminal-type.mp3', volume: 0.25 },
  terminalEnter: { src: './sounds/terminal-enter.mp3', volume: 0.4 },
};

export const useSoundManager = () => {
  const soundsRef = useRef<Map<string, Howl>>(new Map());
  const ambientSoundsRef = useRef<Set<string>>(new Set());
  const masterVolumeRef = useRef<number>(1.0);
  const mutedRef = useRef<boolean>(false);

  // Initialize all sounds on mount
  useEffect(() => {
    const soundsMap = soundsRef.current;

    Object.entries(soundLibrary).forEach(([key, config]) => {
      const sound = new Howl({
        src: [config.src],
        volume: config.volume ?? 0.5,
        loop: config.loop ?? false,
        sprite: config.sprite,
        preload: true,
        html5: config.loop, // Use HTML5 Audio for looping sounds to save memory
      });

      soundsMap.set(key, sound);

      // Track ambient sounds
      if (config.loop) {
        ambientSoundsRef.current.add(key);
      }
    });

    return () => {
      // Cleanup all sounds on unmount
      soundsMap.forEach((sound) => {
        sound.unload();
      });
      soundsMap.clear();
    };
  }, []);

  // Play a sound effect
  const play = useCallback((soundKey: keyof SoundLibrary, options?: { volume?: number; rate?: number }) => {
    const sound = soundsRef.current.get(soundKey);
    if (sound && !mutedRef.current) {
      if (options?.volume !== undefined) {
        sound.volume(options.volume);
      }
      if (options?.rate !== undefined) {
        sound.rate(options.rate);
      }
      sound.play();
    }
  }, []);

  // Stop a sound
  const stop = useCallback((soundKey: keyof SoundLibrary) => {
    const sound = soundsRef.current.get(soundKey);
    if (sound) {
      sound.stop();
    }
  }, []);

  // Pause a sound
  const pause = useCallback((soundKey: keyof SoundLibrary) => {
    const sound = soundsRef.current.get(soundKey);
    if (sound) {
      sound.pause();
    }
  }, []);

  // Resume a paused sound
  const resume = useCallback((soundKey: keyof SoundLibrary) => {
    const sound = soundsRef.current.get(soundKey);
    if (sound && !mutedRef.current) {
      sound.play();
    }
  }, []);

  // Start ambient layer
  const startAmbient = useCallback(() => {
    ambientSoundsRef.current.forEach((key) => {
      const sound = soundsRef.current.get(key);
      if (sound && !mutedRef.current && !sound.playing()) {
        sound.play();
      }
    });
  }, []);

  // Stop all ambient sounds
  const stopAmbient = useCallback(() => {
    ambientSoundsRef.current.forEach((key) => {
      const sound = soundsRef.current.get(key);
      if (sound) {
        sound.stop();
      }
    });
  }, []);

  // Fade in a sound
  const fadeIn = useCallback((soundKey: keyof SoundLibrary, duration: number = 2000, targetVolume?: number) => {
    const sound = soundsRef.current.get(soundKey);
    if (sound && !mutedRef.current) {
      const config = soundLibrary[soundKey];
      const volume = targetVolume ?? config.volume ?? 0.5;
      sound.volume(0);
      sound.play();
      sound.fade(0, volume, duration);
    }
  }, []);

  // Fade out a sound
  const fadeOut = useCallback((soundKey: keyof SoundLibrary, duration: number = 2000) => {
    const sound = soundsRef.current.get(soundKey);
    if (sound) {
      sound.fade(sound.volume(), 0, duration);
      setTimeout(() => sound.stop(), duration);
    }
  }, []);

  // Set master volume (0.0 to 1.0)
  const setMasterVolume = useCallback((volume: number) => {
    masterVolumeRef.current = Math.max(0, Math.min(1, volume));
    Howler.volume(masterVolumeRef.current);
  }, []);

  // Mute/unmute all sounds
  const setMuted = useCallback((muted: boolean) => {
    mutedRef.current = muted;
    Howler.mute(muted);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    Howler.mute(mutedRef.current);
    return mutedRef.current;
  }, []);

  // Play a random variation (useful for repetitive sounds like typing)
  const playRandomVariation = useCallback((soundKey: keyof SoundLibrary) => {
    const sound = soundsRef.current.get(soundKey);
    if (sound && !mutedRef.current) {
      // Randomize pitch slightly for variation
      sound.rate(0.9 + Math.random() * 0.2);
      sound.play();
    }
  }, []);

  return {
    // Basic controls
    play,
    stop,
    pause,
    resume,
    
    // Ambient controls
    startAmbient,
    stopAmbient,
    
    // Advanced controls
    fadeIn,
    fadeOut,
    playRandomVariation,
    
    // Volume controls
    setMasterVolume,
    setMuted,
    toggleMute,
  };
};

export type SoundManagerHook = ReturnType<typeof useSoundManager>;