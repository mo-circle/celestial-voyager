
import React from 'react';
import { PlanetData, SimulationTab, ViewMode } from '../types';
import { PLANETS } from '../constants';

interface DashboardProps {
  selectedPlanet: PlanetData | null;
  timeSpeed: number;
  setTimeSpeed: (val: number) => void;
  isPaused: boolean;
  togglePlay: () => void;
  showLabels: boolean;
  toggleLabels: () => void;
  showStars: boolean;
  toggleStars: () => void;
  showSunFlare: boolean;
  toggleSunFlare: () => void;
  useRealScale: boolean;
  toggleScale: () => void;
  viewMode: ViewMode;
  toggleViewMode: () => void;
  onPlanetSelect: (id: string | null) => void;
  onResetCamera: () => void;
  currentDate: string;
  onDateChange: (date: string) => void;
  onYearJump: (years: number) => void;
  onJumpToToday: () => void;
  onMinimize: () => void;
  activeTab: SimulationTab;
  setActiveTab: (tab: SimulationTab) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  selectedPlanet,
  timeSpeed,
  setTimeSpeed,
  isPaused,
  togglePlay,
  showLabels,
  toggleLabels,
  showStars,
  toggleStars,
  showSunFlare,
  toggleSunFlare,
  useRealScale,
  toggleScale,
  viewMode,
  toggleViewMode,
  onPlanetSelect,
  onResetCamera,
  currentDate,
  onDateChange,
  onYearJump,
  onJumpToToday,
  onMinimize,
  activeTab,
  setActiveTab
}) => {
  return (
    <div className="w-full md:w-80 h-full flex flex-col gap-4 pointer-events-auto">
      <div className="flex-1 glass rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl transition-all duration-300">
        
        {selectedPlanet && (
          <div className="px-6 py-4 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                style={{ backgroundColor: selectedPlanet.color }} 
              />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Tracking {selectedPlanet.name}</span>
            </div>
            <button 
              onClick={onResetCamera}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-[9px] font-black text-white uppercase tracking-widest hover:bg-blue-500/40 transition-all"
            >
              <svg className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Reset
            </button>
          </div>
        )}

        <div className="flex bg-black/40 border-b border-white/5 items-center justify-between pr-4">
          <div className="flex flex-1">
            {Object.values(SimulationTab).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all
                  ${activeTab === tab ? 'text-blue-400 bg-blue-500/10' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button 
            onClick={onMinimize}
            className="ml-2 p-2 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-all"
            title="Minimize"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {activeTab === SimulationTab.Explorer && (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-white/90">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  Target Fleet
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {PLANETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onPlanetSelect(p.id)}
                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all
                      ${selectedPlanet?.id === p.id 
                        ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                        : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:border-white/20'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }} />
                      <span className="text-sm font-bold tracking-tight">{p.name}</span>
                    </div>
                    <div className="text-[10px] font-mono opacity-40 group-hover:opacity-100 transition-opacity">
                      {p.id.slice(0, 3).toUpperCase()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === SimulationTab.Physics && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Temporal Anchor</label>
                  <div className="space-y-3">
                    <input
                      type="date"
                      value={currentDate}
                      onChange={(e) => onDateChange(e.target.value)}
                      className="w-full bg-blue-900/10 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-blue-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                    <div className="grid grid-cols-5 gap-1.5">
                      <button onClick={() => onYearJump(-10)} className="py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-bold border border-white/5">-10Y</button>
                      <button onClick={() => onYearJump(-1)} className="py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-bold border border-white/5">-1Y</button>
                      <button onClick={onJumpToToday} className="py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-[9px] font-black text-blue-300 border border-blue-500/20">NOW</button>
                      <button onClick={() => onYearJump(1)} className="py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-bold border border-white/5">+1Y</button>
                      <button onClick={() => onYearJump(10)} className="py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-bold border border-white/5">+10Y</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5 pt-6 border-t border-white/10">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Time Velocity</label>
                    <span className="text-xs text-white/80 font-bold">Warp Throttle</span>
                  </div>
                  <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/30">{timeSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range" min="0" max="365.25" step="0.5" value={timeSpeed}
                  onChange={(e) => setTimeSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Display Engine</h3>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white/90">Orbital Scale</span>
                    <span className="text-[9px] text-white/20 font-medium">{useRealScale ? 'Accurate' : 'Visual'}</span>
                  </div>
                  <button onClick={toggleScale} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${useRealScale ? 'bg-indigo-600 border-indigo-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>
                    {useRealScale ? 'Real' : 'Visual'}
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white/90">Sun Flare</span>
                    <span className="text-[9px] text-white/20 font-medium">Solar Optics</span>
                  </div>
                  <button onClick={toggleSunFlare} className={`w-12 h-6 rounded-full transition-all relative ${showSunFlare ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${showSunFlare ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white/90">Designators</span>
                    <span className="text-[9px] text-white/20 font-medium">Map Labels</span>
                  </div>
                  <button onClick={toggleLabels} className={`w-12 h-6 rounded-full transition-all relative ${showLabels ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${showLabels ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white/90">Starfield</span>
                    <span className="text-[9px] text-white/20 font-medium">Galactic View</span>
                  </div>
                  <button onClick={toggleStars} className={`w-12 h-6 rounded-full transition-all relative ${showStars ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${showStars ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === SimulationTab.Data && (
            <div className="space-y-6">
              {selectedPlanet ? (
                <>
                  <div className="pb-4 border-b border-white/10">
                    <h2 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">{selectedPlanet.name}</h2>
                    <p className="text-xs text-white/60 leading-relaxed font-medium mt-2">{selectedPlanet.description}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <DataCard label="Mass" value={selectedPlanet.mass} icon="⚖️" />
                    <DataCard label="Gravity" value={selectedPlanet.gravity} icon="🌏" />
                    <DataCard label="Temperature" value={selectedPlanet.temp} icon="🌡️" />
                    <DataCard label="Distance" value={selectedPlanet.distanceFromSun} icon="☀️" />
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-20">
                  <div className="text-6xl mb-6 grayscale">🪐</div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] leading-loose">Data Stream Offline<br/>Select body</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 bg-black/60 border-t border-white/10 flex gap-3">
          <button onClick={togglePlay} className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all ${isPaused ? 'bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:bg-blue-500' : 'bg-white/10 text-white/80 border border-white/10 hover:bg-red-500 hover:text-white hover:border-red-400 shadow-xl'}`}>
            {isPaused ? 'Resume Sync' : 'Halt Systems'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DataCard: React.FC<{ label: string; value: string; icon: string }> = ({ label, value, icon }) => (
  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-blue-500/20 hover:bg-blue-500/5 transition-all group">
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-sm grayscale group-hover:grayscale-0 transition-all">{icon}</span>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white/50">{label}</span>
    </div>
    <div className="text-xl font-mono font-bold text-blue-400 tracking-tight group-hover:text-blue-300 transition-colors">{value}</div>
  </div>
);

export default Dashboard;
