
import React, { useState, useCallback, useEffect, useRef } from 'react';
import SolarSystem from './components/SolarSystem';
import Dashboard from './components/Dashboard';
import NotificationSystem, { Notification } from './components/NotificationSystem';
import { PlanetData, SimulationTab, ViewMode } from './types';
import { PLANETS } from './constants';

const App: React.FC = () => {
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showStars, setShowStars] = useState(true);
  const [showSunFlare, setShowSunFlare] = useState(true);
  const [useRealScale, setUseRealScale] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.System);
  const [activeTab, setActiveTab] = useState<SimulationTab>(SimulationTab.Explorer);
  
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [isDashboardVisible, setIsDashboardVisible] = useState(true);
  const [isHUDVisible, setIsHUDVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isShortcutsVisible, setIsShortcutsVisible] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [simDays, setSimDays] = useState(0);
  const requestRef = useRef<number | null>(null);
  const solarSystemRef = useRef<{ 
    captureScreenshot: () => string | null;
    zoomIn: () => void;
    zoomOut: () => void;
  }>(null);

  const triggerNotification = useCallback((title: string, message: string, type: Notification['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, title, message, type }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    const events = [
      { title: 'Meteor Shower', msg: 'Perseid activity detected near Earth orbit.', type: 'event' },
      { title: 'Alignment', msg: 'Venus and Mars entering rare alignment.', type: 'event' },
      { title: 'Solar Flare', msg: 'Increased radiation from Sun; visibility adjusted.', type: 'alert' },
      { title: 'Telemetry Update', msg: 'Deep space network synchronized.', type: 'info' }
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        const event = events[Math.floor(Math.random() * events.length)];
        triggerNotification(event.title, event.msg, event.type as any);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [triggerNotification]);

  const handlePlanetSelect = useCallback((id: string | null) => {
    setSelectedPlanetId(id);
    setViewMode(id ? ViewMode.Focus : ViewMode.System);
    if (id) {
      const p = PLANETS.find(planet => planet.id === id);
      triggerNotification('Target Lock', `Tracking ${p?.name}`, 'info');
    }
  }, [triggerNotification]);

  const handleResetCamera = useCallback(() => {
    setSelectedPlanetId(null);
    setViewMode(ViewMode.System);
  }, []);

  const handleScreenshot = useCallback(() => {
    const dataUrl = solarSystemRef.current?.captureScreenshot();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `celestial-voyager-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
      triggerNotification('Screenshot', 'View captured and saved.', 'info');
    }
  }, [triggerNotification]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch(e.code) {
        case 'Space':
          e.preventDefault();
          setIsPaused(p => !p);
          triggerNotification('Sim Status', isPaused ? 'Resumed' : 'Paused', 'info');
          break;
        case 'KeyH':
          setIsUIVisible(v => !v);
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyS':
          handleScreenshot();
          break;
        case 'KeyR':
          handleResetCamera();
          triggerNotification('Navigation', 'Orientation Reset', 'info');
          break;
        case 'KeyK': // Toggle Sun Flare
          setShowSunFlare(prev => {
            const next = !prev;
            triggerNotification('Optics', next ? 'Sun Flare Enabled' : 'Sun Flare Disabled', 'info');
            return next;
          });
          break;
        case 'Equal': // '+'
          solarSystemRef.current?.zoomIn();
          break;
        case 'Minus': // '-'
          solarSystemRef.current?.zoomOut();
          break;
        case 'BracketLeft': // '['
          setSimDays(p => p - 365.25);
          triggerNotification('Temporal Shift', '-1 Year', 'info');
          break;
        case 'BracketRight': // ']'
          setSimDays(p => p + 365.25);
          triggerNotification('Temporal Shift', '+1 Year', 'info');
          break;
        case 'Comma': // '<'
          setSimDays(p => p - 30.44);
          triggerNotification('Temporal Shift', '-1 Month', 'info');
          break;
        case 'Period': // '>'
          setSimDays(p => p + 30.44);
          triggerNotification('Temporal Shift', '+1 Month', 'info');
          break;
        case 'Slash': // '?'
          if (e.shiftKey) setIsShortcutsVisible(v => !v);
          break;
        case 'KeyT':
          setSimDays((Date.now() - new Date(2000, 0, 1).getTime()) / 86400000);
          triggerNotification('Temporal Sync', 'Current Date reached', 'info');
          break;
        case 'KeyL':
          setShowLabels(l => !l);
          break;
        case 'KeyG':
          setShowStars(s => !s);
          break;
        case 'KeyE': setActiveTab(SimulationTab.Explorer); break;
        case 'KeyP': setActiveTab(SimulationTab.Physics); break;
        case 'KeyD': setActiveTab(SimulationTab.Data); break;
        case 'ArrowUp': setTimeSpeed(s => Math.min(s + 5, 365)); break;
        case 'ArrowDown': setTimeSpeed(s => Math.max(s - 5, 0)); break;
        case 'Escape':
          if (isShortcutsVisible) setIsShortcutsVisible(false);
          if (isFullscreen) toggleFullscreen();
          break;
      }

      if (e.key >= '1' && e.key <= '8') {
        const index = parseInt(e.key) - 1;
        if (PLANETS[index]) handlePlanetSelect(PLANETS[index].id);
      }
      if (e.key === '0') handleResetCamera();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, isFullscreen, isShortcutsVisible, handlePlanetSelect, handleResetCamera, toggleFullscreen, handleScreenshot, triggerNotification]);

  useEffect(() => {
    if (isPaused) return;
    let last = performance.now();
    const loop = () => {
      const now = performance.now();
      setSimDays(p => p + ((now - last) / 1000) * timeSpeed);
      last = now;
      requestRef.current = requestAnimationFrame(loop);
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isPaused, timeSpeed]);

  const selectedPlanet = PLANETS.find(p => p.id === selectedPlanetId) || null;

  const formattedDate = () => {
    const d = new Date(2000, 0, 1);
    d.setUTCDate(d.getUTCDate() + Math.floor(simDays));
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      <SolarSystem
        ref={solarSystemRef}
        selectedPlanetId={selectedPlanetId}
        onPlanetClick={handlePlanetSelect}
        simDays={simDays}
        showLabels={showLabels}
        showStars={showStars}
        showSunFlare={showSunFlare}
        useRealScale={useRealScale}
        viewMode={viewMode}
      />

      <NotificationSystem notifications={notifications} removeNotification={removeNotification} />

      {/* Shortcuts Help Overlay */}
      {isShortcutsVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setIsShortcutsVisible(false)} />
          <div className="glass w-full max-w-2xl rounded-3xl p-8 border border-white/10 shadow-2xl relative pointer-events-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-black tracking-tight text-blue-400">Navigation Matrix</h3>
              <button onClick={() => setIsShortcutsVisible(false)} className="p-2 rounded-xl hover:bg-white/5 transition-all text-white/40">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-2">
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2">Systems</h4>
                <ShortcutRow keyStr="Space" desc="Play / Pause" />
                <ShortcutRow keyStr="H" desc="Toggle All UI" />
                <ShortcutRow keyStr="F" desc="Fullscreen" />
                <ShortcutRow keyStr="S" desc="Screenshot" />
                <ShortcutRow keyStr="R" desc="Reset View" />
                <ShortcutRow keyStr="K" desc="Sun Flare" />
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2">Navigation</h4>
                <ShortcutRow keyStr="+" desc="Zoom In" />
                <ShortcutRow keyStr="-" desc="Zoom Out" />
                <ShortcutRow keyStr="[" desc="Back 1 Year" />
                <ShortcutRow keyStr="]" desc="Forward 1 Year" />
                <ShortcutRow keyStr="<" desc="Back 1 Month" />
                <ShortcutRow keyStr=">" desc="Forward 1 Month" />
                <ShortcutRow keyStr="T" desc="Jump to Today" />
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2">Interface</h4>
                <ShortcutRow keyStr="E/P/D" desc="Explorer/Physics/Data" />
                <ShortcutRow keyStr="L / G" desc="Labels / Stars" />
                <ShortcutRow keyStr="↑ / ↓" desc="Sim Speed" />
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2">Telemetry</h4>
                <ShortcutRow keyStr="1 - 8" desc="Planets" />
                <ShortcutRow keyStr="0" desc="Origin (Sun)" />
              </div>
            </div>
            <p className="mt-8 text-[9px] text-white/20 font-black uppercase tracking-[0.2em] text-center">Voyager OS v2.7 • Press ESC to close</p>
          </div>
        </div>
      )}

      <div className={`absolute top-6 right-6 flex items-center gap-3 z-50 pointer-events-auto transition-opacity duration-300 ${isUIVisible ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={() => setIsShortcutsVisible(true)} className="glass p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-white/50 hover:text-white" title="Commands (?)">
          <span className="text-xs font-bold px-1">?</span>
        </button>
        <button onClick={handleScreenshot} className="glass p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all" title="Screenshot (S)">
          <CameraIcon />
        </button>
        <button onClick={toggleFullscreen} className="glass p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all" title="Fullscreen (F)">
          {isFullscreen ? <ShrinkIcon /> : <ExpandIcon />}
        </button>
        <button onClick={() => setIsUIVisible(!isUIVisible)} className={`glass p-3 rounded-xl border transition-all ${!isUIVisible ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 hover:bg-white/5'}`} title="Zen Mode (H)">
          {isUIVisible ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      </div>

      {!isUIVisible && (
        <button onClick={() => setIsUIVisible(true)} className="absolute top-6 right-6 glass p-3 rounded-xl z-[100] border border-blue-500/50 bg-blue-500/20 text-blue-400 animate-pulse">
          <EyeOffIcon />
        </button>
      )}

      <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${isUIVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative w-full h-full p-6 flex gap-6">
          <div className={`transition-transform duration-500 pointer-events-auto ${isDashboardVisible ? 'translate-x-0' : '-translate-x-[110%]'}`}>
            <Dashboard
              selectedPlanet={selectedPlanet}
              timeSpeed={timeSpeed}
              setTimeSpeed={setTimeSpeed}
              isPaused={isPaused}
              togglePlay={() => setIsPaused(!isPaused)}
              showLabels={showLabels}
              toggleLabels={() => setShowLabels(!showLabels)}
              showStars={showStars}
              toggleStars={() => setShowStars(!showStars)}
              showSunFlare={showSunFlare}
              toggleSunFlare={() => setShowSunFlare(!showSunFlare)}
              useRealScale={useRealScale}
              toggleScale={() => setUseRealScale(!useRealScale)}
              viewMode={viewMode}
              toggleViewMode={() => setViewMode(viewMode === ViewMode.System ? ViewMode.Focus : ViewMode.System)}
              onPlanetSelect={handlePlanetSelect}
              onResetCamera={handleResetCamera}
              currentDate={new Date(2000, 0, 1 + Math.floor(simDays)).toISOString().split('T')[0]}
              onDateChange={d => setSimDays((new Date(d).getTime() - new Date(2000, 0, 1).getTime()) / 86400000)}
              onYearJump={y => setSimDays(p => p + y * 365.25)}
              onJumpToToday={() => setSimDays((Date.now() - new Date(2000,0,1).getTime())/86400000)}
              onMinimize={() => setIsDashboardVisible(false)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          {!isDashboardVisible && isUIVisible && (
            <button onClick={() => setIsDashboardVisible(true)} className="absolute left-6 top-6 glass p-3 rounded-xl pointer-events-auto border border-white/10 hover:border-blue-500 transition-all shadow-xl">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
          )}

          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 glass px-8 py-4 rounded-3xl flex items-center gap-10 border border-white/10 shadow-2xl pointer-events-auto transition-transform duration-500 ${isHUDVisible ? 'translate-y-0' : 'translate-y-[150%]'}`}>
             <div className="flex flex-col items-center">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-1">Celestial Date</span>
                <span className="text-xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                  {formattedDate().toUpperCase()}
                </span>
             </div>
             <div className="w-px h-8 bg-white/10" />
             <div className="flex flex-col items-center">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-1">Sim Speed</span>
                <span className="text-lg font-bold font-mono text-blue-400">{timeSpeed.toFixed(1)}<span className="text-[10px] ml-1">D/S</span></span>
             </div>
             <button onClick={() => setIsHUDVisible(false)} className="ml-4 opacity-30 hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShortcutRow: React.FC<{ keyStr: string; desc: string }> = ({ keyStr, desc }) => (
  <div className="flex items-center justify-between gap-4 py-1.5 border-b border-white/5 last:border-0">
    <span className="text-xs text-white/60 font-medium">{desc}</span>
    <kbd className="px-2 py-1 bg-white/10 rounded-lg text-[10px] font-black font-mono border border-white/10 min-w-[32px] text-center shadow-inner text-blue-300">{keyStr}</kbd>
  </div>
);

const EyeIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeOffIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>;
const ExpandIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>;
const ShrinkIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 4v5m0 0H4m5 0L4 4m11 0l5 5m-5-5v5m0 0h5m-5 6v5m0-5h5m-5 0l5 5m-11 0l-5-5m5 5v-5m0 0H4" /></svg>;
const CameraIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default App;
