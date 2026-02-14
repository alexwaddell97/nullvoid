import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SplashScreen } from './components/boot/SplashScreen';
import { CRTBoot } from './components/boot/CRTBoot';
import { BIOSScreen } from './components/boot/BIOSScreen';
import { TerminalLoad } from './components/boot/TerminalLoad';
import { Desktop } from './components/boot/Desktop';
import { useSoundManager } from './hooks/useSoundManager';
import { GlobalNotesButton } from './components/shared/GlobalNotesButton';



type BootPhase = 'splash' | 'crt-boot' | 'bios' | 'terminal-load' | 'desktop';

function App() {
  const [bootPhase, setBootPhase] = useState<BootPhase>('splash');
  const sound = useSoundManager();

  // Boot sequence timing
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    sound.play('logoJingle'); // Play logo jingle at the start of the splash screen

    // Phase 0: Splash screen (3 seconds)
    timers.push(setTimeout(() => setBootPhase('crt-boot'), 6000));

    // Phase 1: CRT boot (2 seconds)
    timers.push(setTimeout(() => setBootPhase('bios'), 8000));

    // Phase 2: BIOS screen (2 seconds)
    timers.push(setTimeout(() => setBootPhase('terminal-load'), 10000));

    // Phase 3: Terminal load (7 seconds - time for all lines to display)
    timers.push(setTimeout(() => setBootPhase('desktop'), 17000));

    return () => timers.forEach(clearTimeout);
  }, []);

  //Play sounds on phase changes
  useEffect(() => {

    if (bootPhase === 'crt-boot') {
        setTimeout(() => sound.play('crtPowerOn'), 800); // Play power-on sound shortly after CRT effect starts
        setTimeout(() => sound.play('crtPowerOnLoop'), 9100); 
        setTimeout(() => sound.stop('crtPowerOnLoop'), 12500);
      sound.play('staticBurst');
    }
    if (bootPhase === 'desktop') {
      sound.play('successChime');
      sound.play('crtHumStart');
      setTimeout(() => sound.stop('crtHumStart'), 9000); // Stop initial hum after it plays
      setTimeout(() => sound.play('crtHumLoop'), 9000); // Start loop after initial hum
      sound.stop('dataStream');
      sound.startAmbient();
    }
  }, [bootPhase, sound]);

  return (
    <div className="min-h-screen min-w-screen bg-black font-mono overflow-hidden">
      {/* CRT Effect Overlay - always visible */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {/* Scanline animation */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-green-500/5 to-transparent animate-scan" />
        {/* Scanline texture */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,255,0,0.03)_0px,transparent_1px,transparent_2px,rgba(0,255,0,0.03)_3px)] opacity-20" />
        {/* Screen curvature vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Global Notes Button - Only show after desktop loads */}
      {bootPhase === 'desktop' && <GlobalNotesButton />}

      {/* Boot Sequence */}
      <AnimatePresence mode="wait">
        {bootPhase === 'splash' && <SplashScreen key="splash" />}
        {bootPhase === 'crt-boot' && <CRTBoot key="crt-boot" />}
        {bootPhase === 'bios' && <BIOSScreen key="bios" />}
        {bootPhase === 'terminal-load' && <TerminalLoad key="terminal-load" />}
        {bootPhase === 'desktop' && <Desktop key="desktop" />}
      </AnimatePresence>
    </div>
  );
}

export default App;
