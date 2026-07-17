import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Map, Layers, Navigation, Shield, Wind, Droplets, AlertTriangle, Truck, Cpu, Activity, Zap } from 'lucide-react';

const HOTSPOTS_DATA = [
  {
    id: 'TRF-NODE-01',
    type: 'traffic',
    name: 'Downtown Junction Loop',
    status: 'Online',
    metric: 'Congestion: 84% (Critical)',
    details: 'Commuter queues peak. Alternate routes highly recommended.',
    x: 380,
    y: 180,
    color: '#ef4444'
  },
  {
    id: 'TRF-NODE-02',
    type: 'traffic',
    name: 'West Ring Road Bypass',
    status: 'Online',
    metric: 'Congestion: 52% (Moderate)',
    details: 'Flowing smoothly. Primary bypass connecting suburbs to industrial area.',
    x: 210,
    y: 180,
    color: '#eab308'
  },
  {
    id: 'TRF-NODE-03',
    type: 'traffic',
    name: 'Waterfront Ring Link Node',
    status: 'Online',
    metric: 'Congestion: 28% (Optimal)',
    details: 'Free flow active. Average commuter speeds: 58 km/h.',
    x: 680,
    y: 180,
    color: '#10b981'
  },
  {
    id: 'AQI-NODE-01',
    type: 'pollution',
    name: 'Sector B Exhaust Sensor',
    status: 'Online',
    metric: 'AQI: 168 (Hazardous)',
    details: 'Particulate spike detected. Consider active green zone routing.',
    x: 160,
    y: 320,
    color: '#ef4444'
  },
  {
    id: 'AQI-NODE-02',
    type: 'pollution',
    name: 'Sector A Central AQI Node',
    status: 'Online',
    metric: 'AQI: 72 (Moderate)',
    details: 'Regular vehicle emissions. Safe ambient parameters currently.',
    x: 350,
    y: 110,
    color: '#f97316'
  },
  {
    id: 'AQI-NODE-03',
    type: 'pollution',
    name: 'Sector C Air Tracker Node',
    status: 'Online',
    metric: 'AQI: 42 (Excellent)',
    details: 'Marine ventilation effect active. Exceptional air parameters.',
    x: 550,
    y: 150,
    color: '#10b981'
  }
];

interface InteractiveMapProps {
  activeTab: string;
  trafficData?: any;
  pollutionData?: any;
  waterData?: any;
  crimeData?: any;
  alertsData?: any;
}

export default function InteractiveMap({
  activeTab,
  trafficData,
  pollutionData,
  waterData,
  crimeData,
  alertsData
}: InteractiveMapProps) {
  // Layer states
  const [showTraffic, setShowTraffic] = useState(true);
  const [showPollution, setShowPollution] = useState(false);
  const [showCrime, setShowCrime] = useState(false);
  const [showWater, setShowWater] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);

  // Hotspot hover interaction states
  const [hoveredHotspot, setHoveredHotspot] = useState<any | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<any | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleMouseEnterHotspot = (hotspot: any) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setHoveredHotspot(hotspot);
  };

  const handleMouseLeaveHotspot = () => {
    const timeout = setTimeout(() => {
      setHoveredHotspot(null);
    }, 450); // Delay allows easy mouse transition onto the tooltip itself
    setHoverTimeout(timeout);
  };

  const handleMouseEnterTooltip = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const triggerQuickAction = (hotspot: any, actionName: string) => {
    let msg = "";
    if (hotspot.type === 'traffic') {
      if (actionName === 'sync') {
        msg = `⚡ AI Optimization Desk: Synchronized signals at ${hotspot.name}! Flow increased by 15%.`;
      } else {
        msg = `🛣️ Rerouting Commuters: Suggested alternate path to bypass ${hotspot.name}.`;
      }
    } else {
      if (actionName === 'calibrate') {
        msg = `🔬 Calibration Complete: Electrochemical sensors on ${hotspot.name} recalibrated to benchmark standards.`;
      } else {
        msg = `💨 Carbon Mitigation: Localized air scrubbers activated around ${hotspot.name} in response to ${hotspot.metric}!`;
      }
    }
    setActionFeedback(msg);
    setTimeout(() => {
      setActionFeedback(null);
    }, 4000);
    setHoveredHotspot(null);
  };

  // Selected Sector details
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Moving vehicles simulation state
  const [vehicles, setVehicles] = useState([
    { id: 'BUS-10', sector: 'Sector A (Downtown)', type: 'Transit', x: 250, y: 190, speedX: 0.8, speedY: 0.3 },
    { id: 'EV-PR-4', sector: 'Sector C (Residential East)', type: 'City Patrol', x: 550, y: 220, speedX: -0.5, speedY: 0.8 },
    { id: 'TRK-22', sector: 'Sector B (Industrial)', type: 'Logistics', x: 180, y: 380, speedX: 1.2, speedY: -0.2 },
    { id: 'AMB-09', sector: 'Sector A (Downtown)', type: 'Emergency', x: 380, y: 140, speedX: -0.3, speedY: -0.7 },
    { id: 'WTR-PL-1', sector: 'Sector D (Suburbs West)', type: 'Water Utility', x: 420, y: 340, speedX: 0.6, speedY: 0.4 }
  ]);

  // Update layer states based on active parent tabs to make the experience seamless!
  useEffect(() => {
    if (activeTab === 'traffic') {
      setShowTraffic(true);
      setShowPollution(false);
      setShowCrime(false);
      setShowWater(false);
    } else if (activeTab === 'pollution') {
      setShowTraffic(false);
      setShowPollution(true);
      setShowCrime(false);
      setShowWater(false);
    } else if (activeTab === 'water') {
      setShowTraffic(false);
      setShowPollution(false);
      setShowCrime(false);
      setShowWater(true);
    } else if (activeTab === 'crime') {
      setShowTraffic(false);
      setShowPollution(false);
      setShowCrime(true);
      setShowWater(false);
    } else if (activeTab === 'alerts') {
      setShowAlerts(true);
    }
  }, [activeTab]);

  // Animate simulated vehicles across the map canvas bounds
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        let newX = v.x + v.speedX;
        let newY = v.y + v.speedY;

        // Bounce back if boundaries exceeded
        let sx = v.speedX;
        let sy = v.speedY;
        if (newX < 50 || newX > 750) sx = -v.speedX;
        if (newY < 50 || newY > 450) sy = -v.speedY;

        return {
          ...v,
          x: Math.max(50, Math.min(750, newX)),
          y: Math.max(50, Math.min(450, newY)),
          speedX: sx,
          speedY: sy
        };
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Sector visual coordinate mapping
  const sectorsVisual = [
    { name: 'Sector A (Downtown)', color: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', d: 'M 100 50 L 400 50 L 350 250 L 50 250 Z', textX: 200, textY: 130 },
    { name: 'Sector B (Industrial)', color: 'rgba(234, 179, 8, 0.1)', border: '#eab308', d: 'M 50 250 L 350 250 L 280 450 L 50 450 Z', textX: 180, textY: 340 },
    { name: 'Sector C (Residential East)', color: 'rgba(16, 185, 129, 0.1)', border: '#10b981', d: 'M 400 50 L 750 50 L 750 250 L 350 250 Z', textX: 550, textY: 130 },
    { name: 'Sector D (Suburbs West)', color: 'rgba(139, 92, 246, 0.1)', border: '#8b5cf6', d: 'M 350 250 L 750 250 L 750 450 L 280 450 Z', textX: 530, textY: 350 },
    { name: 'Sector E (Waterfront)', color: 'rgba(6, 182, 212, 0.1)', border: '#06b6d4', d: 'M 350 210 Q 420 180 480 230 T 600 200 L 580 300 Q 450 310 350 260 Z', textX: 460, textY: 250 }
  ];

  // Dynamic values calculated from incoming telemetry props
  const getSectorAqiColor = (sectorName: string) => {
    if (!pollutionData) return 'rgba(16, 185, 129, 0.2)'; // default green
    const sector = pollutionData.sectorAqi?.find((s: any) => s.sector === sectorName);
    const aqi = sector?.aqi || 50;
    if (aqi > 150) return 'rgba(239, 68, 68, 0.4)'; // poor red
    if (aqi > 100) return 'rgba(249, 115, 22, 0.3)'; // orange
    if (aqi > 50) return 'rgba(234, 179, 8, 0.25)'; // yellow
    return 'rgba(16, 185, 129, 0.15)'; // optimal green
  };

  const getSectorTrafficColor = (sectorName: string) => {
    if (sectorName.includes('Downtown')) return '#ef4444'; // Heavy traffic Red
    if (sectorName.includes('Industrial')) return '#10b981'; // Flowing traffic Green
    if (sectorName.includes('Waterfront')) return '#f97316'; // Slow traffic Orange
    return '#10b981'; // Green
  };

  return (
    <div className="bg-white dark:bg-[#1a1b26] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full" id="city_interactive_map_container">
      {/* Map Header and Controls */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Live Interactive Municipal Grid</h2>
        </div>
        
        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button 
            onClick={() => setShowTraffic(!showTraffic)} 
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border transition-all ${showTraffic ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900' : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Traffic
          </button>

          <button 
            onClick={() => setShowPollution(!showPollution)} 
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border transition-all ${showPollution ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900' : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}
          >
            <Wind className="w-3.5 h-3.5" />
            AQI Pollution
          </button>

          <button 
            onClick={() => setShowWater(!showWater)} 
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border transition-all ${showWater ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900' : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}
          >
            <Droplets className="w-3.5 h-3.5" />
            Water Pipes
          </button>

          <button 
            onClick={() => setShowCrime(!showCrime)} 
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border transition-all ${showCrime ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900' : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}
          >
            <Shield className="w-3.5 h-3.5" />
            Security Hotspots
          </button>

          <button 
            onClick={() => showAlerts(!showAlerts)} 
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border transition-all ${showAlerts ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900' : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Alerts
          </button>

          <button 
            onClick={() => setShowVehicles(!showVehicles)} 
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border transition-all ${showVehicles ? 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900' : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}
          >
            <Truck className="w-3.5 h-3.5" />
            Live Patrols
          </button>
        </div>
      </div>

      {/* Map SVG Body Container */}
      <div className="relative flex-1 bg-[#f1f5f9] dark:bg-[#0f111a] min-h-[350px] flex items-center justify-center p-4 overflow-hidden select-none">
        
        {/* OpenStreetMap Reference watermark in footer for literal authenticity */}
        <div className="absolute bottom-2 right-3 font-mono text-[9px] text-slate-400 dark:text-slate-600 pointer-events-none">
          Leaflet/OpenStreetMap municipal overlay standard. Grid system calibrated.
        </div>

        <svg 
          viewBox="0 0 800 500" 
          className="w-full h-full max-h-[460px] drop-shadow-lg transition-colors"
          style={{ aspectRatio: '8/5' }}
        >
          {/* Base Grid Lines for high-tech aesthetic */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-800/60" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#grid)" />

          {/* Sector Areas */}
          {sectorsVisual.map((sec, i) => {
            const isSelected = selectedSector === sec.name;
            const aqiColor = getSectorAqiColor(sec.name);
            const baseFill = showPollution ? aqiColor : (isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(100, 116, 139, 0.05)');
            
            return (
              <g key={i} className="cursor-pointer" onClick={() => setSelectedSector(isSelected ? null : sec.name)}>
                <path 
                  d={sec.d} 
                  fill={baseFill} 
                  stroke={sec.border} 
                  strokeWidth={isSelected ? "3" : "1.5"} 
                  className="transition-all duration-300 hover:fill-indigo-500/10 dark:hover:fill-indigo-400/10" 
                />
                <text 
                  x={sec.textX} 
                  y={sec.textY} 
                  textAnchor="middle" 
                  className="fill-slate-500 dark:fill-slate-400 font-sans text-[11px] font-semibold tracking-wider select-none pointer-events-none"
                >
                  {sec.name.replace('Sector ', 'SEC-')}
                </text>
              </g>
            );
          })}

          {/* Water Pipeline Overlay (Blue pipes) */}
          {showWater && (
            <g opacity="0.85">
              {/* Pipeline trunk lines */}
              <path d="M 120 100 Q 250 180 350 250 T 550 350" fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
              <path d="M 450 60 L 450 250 L 180 380" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeDasharray="5,5" />
              <path d="M 50 300 H 750" fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
              
              {/* Pulsing pipeline connections */}
              <circle cx="350" cy="250" r="8" fill="#1d4ed8" className="animate-ping" />
              <circle cx="350" cy="250" r="5" fill="#2563eb" />
              <circle cx="180" cy="380" r="4" fill="#3b82f6" />
              <circle cx="550" cy="350" r="4" fill="#60a5fa" />
              
              {/* Water flow direction markers */}
              <text x="240" y="160" className="fill-blue-200 font-sans text-[8px] italic animate-pulse">FLOW &gt;&gt;</text>
              <text x="600" y="315" className="fill-blue-200 font-sans text-[8px] italic animate-pulse">FLOW &gt;&gt;</text>
            </g>
          )}

          {/* Traffic Overlay (Colored arterial roadways and dynamic hotspots) */}
          {showTraffic && (
            <g opacity="0.9">
              {/* Expressway 1 (Vertical) */}
              <path 
                d="M 380 30 L 380 470" 
                fill="none" 
                stroke={getSectorTrafficColor('Sector A (Downtown)')} 
                strokeWidth="7" 
                strokeLinecap="round" 
              />
              
              {/* Ring Road Bypass */}
              <path 
                d="M 120 50 C 150 250, 200 350, 480 430 C 650 420, 750 300, 700 80" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="5" 
                strokeLinecap="round" 
              />

              {/* Crosstown Connector */}
              <path 
                d="M 60 180 L 740 180" 
                fill="none" 
                stroke={getSectorTrafficColor('Sector E (Waterfront)')} 
                strokeWidth="6" 
                strokeLinecap="round" 
              />
              
              {/* Interactive Traffic loop hotspots */}
              {HOTSPOTS_DATA.filter(h => h.type === 'traffic').map((hotspot) => (
                <g
                  key={hotspot.id}
                  className="cursor-pointer group/node"
                  transform={`translate(${hotspot.x}, ${hotspot.y})`}
                  onMouseEnter={() => handleMouseEnterHotspot(hotspot)}
                  onMouseLeave={handleMouseLeaveHotspot}
                >
                  <circle cx="0" cy="0" r="11" fill="rgba(255,255,255,0.92)" stroke={hotspot.color} strokeWidth="2" className="transition-transform duration-200 group-hover/node:scale-125" />
                  <circle cx="0" cy="0" r="5" fill={hotspot.color} className="animate-ping" style={{ animationDuration: '2s' }} />
                  <circle cx="0" cy="0" r="3.5" fill={hotspot.color} />
                </g>
              ))}
            </g>
          )}

          {/* Pollution Monitoring Stations Overlay */}
          {showPollution && (
            <g opacity="0.95">
              {HOTSPOTS_DATA.filter(h => h.type === 'pollution').map((hotspot) => (
                <g 
                  key={hotspot.id} 
                  className="cursor-pointer group/node"
                  transform={`translate(${hotspot.x}, ${hotspot.y})`}
                  onMouseEnter={() => handleMouseEnterHotspot(hotspot)}
                  onMouseLeave={handleMouseLeaveHotspot}
                >
                  <circle cx="0" cy="0" r="14" fill="rgba(255,255,255,0.92)" stroke={hotspot.color} strokeWidth="1.5" className="animate-pulse" />
                  <circle cx="0" cy="0" r="5" fill={hotspot.color} className="transition-transform duration-200 group-hover/node:scale-125" />
                  {/* Small antenna spike line for sensor tower representation */}
                  <line x1="0" y1="0" x2="0" y2="-12" stroke={hotspot.color} strokeWidth="2" />
                  <circle cx="0" cy="-12" r="3" fill="#fff" stroke={hotspot.color} strokeWidth="1.5" />
                  <circle cx="0" cy="-12" r="1" fill={hotspot.color} className="animate-ping" />
                </g>
              ))}
            </g>
          )}

          {/* Crime Hotspots Layer (Pulsing targets) */}
          {showCrime && (
            <g>
              {/* Pulse 1: Downtown theft hotspot */}
              <circle cx="280" cy="140" r="15" fill="none" stroke="#a855f7" strokeWidth="2" className="animate-pulse" />
              <circle cx="280" cy="140" r="6" fill="#a855f7" opacity="0.7" />
              <circle cx="280" cy="140" r="2" fill="#d8b4fe" />
              
              {/* Pulse 2: Industrial sector warehouses */}
              <circle cx="160" cy="320" r="18" fill="none" stroke="#7e22ce" strokeWidth="1.5" className="animate-ping" style={{ animationDuration: '3s' }} />
              <circle cx="160" cy="320" r="5" fill="#7e22ce" opacity="0.8" />
              
              {/* Pulse 3: Waterfront night spot */}
              <circle cx="480" cy="240" r="12" fill="none" stroke="#a855f7" strokeWidth="2" className="animate-pulse" />
              <circle cx="480" cy="240" r="4" fill="#a855f7" />
            </g>
          )}

          {/* Emergency Active Alerts indicators */}
          {showAlerts && (
            <g>
              {/* Red glowing hazard triangles at active alerts */}
              <g className="cursor-pointer" transform="translate(320, 110)">
                <circle cx="0" cy="0" r="16" fill="rgba(239, 68, 68, 0.2)" className="animate-ping" />
                <polygon points="0,-8 9,8 -9,8" fill="#ef4444" />
                <text x="0" y="18" textAnchor="middle" className="fill-red-600 dark:fill-red-400 font-sans text-[8px] font-bold">ALT-01</text>
              </g>

              <g className="cursor-pointer" transform="translate(140, 360)">
                <circle cx="0" cy="0" r="12" fill="rgba(249, 115, 22, 0.25)" className="animate-ping" style={{ animationDuration: '2.5s' }} />
                <polygon points="0,-7 8,7 -8,7" fill="#f97316" />
                <text x="0" y="16" textAnchor="middle" className="fill-orange-600 dark:fill-orange-400 font-sans text-[8px] font-bold">ALT-02</text>
              </g>
            </g>
          )}

          {/* Live Vehicle Tracking (Moving items) */}
          {showVehicles && vehicles.map((v, idx) => {
            let color = '#06b6d4'; // Transit Cyan
            if (v.type === 'City Patrol') color = '#3b82f6'; // Police Blue
            if (v.type === 'Emergency') color = '#ef4444'; // Ambulance Red
            if (v.type === 'Water Utility') color = '#eab308'; // Maintenance Orange
            
            return (
              <g key={v.id} transform={`translate(${v.x}, ${v.y})`}>
                <circle cx="0" cy="0" r="7" fill="rgba(255,255,255,0.9)" stroke={color} strokeWidth="2" />
                <circle cx="0" cy="0" r="2" fill={color} />
                <title>{`${v.id} (${v.type})`}</title>
              </g>
            );
          })}
        </svg>

        {/* Selected Sector Context Panel */}
        {selectedSector && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 bg-white/95 dark:bg-[#1f202e]/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-800 text-xs w-64 max-w-[calc(100%-32px)] text-slate-700 dark:text-slate-300 pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-slate-800 dark:text-slate-100">{selectedSector}</span>
              <button 
                onClick={() => setSelectedSector(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                &times;
              </button>
            </div>
            <div className="space-y-1.5 font-mono text-[10px]">
              <div className="flex justify-between">
                <span>Congestion Rating:</span>
                <span className={selectedSector.includes('Downtown') ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
                  {selectedSector.includes('Downtown') ? '74% (Heavy)' : '28% (Optimal)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Avg Air Quality (AQI):</span>
                <span className={selectedSector.includes('Industrial') ? 'text-red-500 font-bold' : 'text-green-500'}>
                  {selectedSector.includes('Industrial') ? '168 (Hazard)' : (selectedSector.includes('Suburbs') ? '34 (Excellent)' : '72 (Moderate)')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pipeline Sound Scans:</span>
                <span className="text-emerald-500">Normal</span>
              </div>
              <div className="flex justify-between">
                <span>Security Patrols:</span>
                <span className="text-slate-500">3 Units Active</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1.5 font-sans">
                <span>Coordinates:</span>
                <span className="text-slate-400">LAT 35.689, LNG 139.692</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Detailed custom tooltips on hotspot hover */}
        {hoveredHotspot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onMouseEnter={handleMouseEnterTooltip}
            onMouseLeave={handleMouseLeaveHotspot}
            className="absolute bg-white/95 dark:bg-[#1a1b26]/95 backdrop-blur-md p-3.5 rounded-xl shadow-2xl border border-slate-150 dark:border-slate-800 w-64 text-slate-700 dark:text-slate-300 z-50 pointer-events-auto"
            style={{
              left: `${(hoveredHotspot.x / 800) * 100}%`,
              top: `${(hoveredHotspot.y / 500) * 100}%`,
              transform: 'translate(-50%, -106%)'
            }}
          >
            {/* Tooltip Header */}
            <div className="flex justify-between items-start mb-1.5">
              <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug pr-2">{hoveredHotspot.name}</h5>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold shrink-0 ${
                hoveredHotspot.status === 'Online' 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-amber-500/10 text-amber-600'
              }`}>
                ● {hoveredHotspot.status}
              </span>
            </div>

            {/* Metric Display */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/60 mb-2">
              <Activity className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="text-[9px] font-mono font-black text-slate-800 dark:text-slate-300">
                {hoveredHotspot.metric}
              </span>
            </div>

            {/* Description */}
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mb-3">
              {hoveredHotspot.details}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              {hoveredHotspot.type === 'traffic' ? (
                <>
                  <button
                    onClick={() => triggerQuickAction(hoveredHotspot, 'sync')}
                    className="flex-1 py-1 px-1.5 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold text-[8px] uppercase tracking-wider transition-colors duration-150 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Cpu className="w-2.5 h-2.5 shrink-0" />
                    <span>Sync AI</span>
                  </button>
                  <button
                    onClick={() => triggerQuickAction(hoveredHotspot, 'reroute')}
                    className="flex-1 py-1 px-1.5 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[8px] uppercase tracking-wider transition-colors duration-150 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-2.5 h-2.5 shrink-0" />
                    <span>Reroute</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => triggerQuickAction(hoveredHotspot, 'calibrate')}
                    className="flex-1 py-1 px-1.5 rounded bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold text-[8px] uppercase tracking-wider transition-colors duration-150 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-2.5 h-2.5 shrink-0" />
                    <span>Calibrate</span>
                  </button>
                  <button
                    onClick={() => triggerQuickAction(hoveredHotspot, 'scrub')}
                    className="flex-1 py-1 px-1.5 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-[8px] uppercase tracking-wider transition-colors duration-150 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Wind className="w-2.5 h-2.5 shrink-0" />
                    <span>Scrub Air</span>
                  </button>
                </>
              )}
            </div>

            {/* Little aesthetic anchor triangle pointing down to the hotspot */}
            <div className="absolute bottom-[-6px] left-[50%] translate-x-[-50%] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white dark:border-t-[#1a1b26] pointer-events-none"></div>
          </motion.div>
        )}

        {/* Float Action Feedback message toast */}
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-slate-950/95 dark:bg-slate-50/95 backdrop-blur-md text-slate-50 dark:text-slate-950 rounded-full shadow-2xl border border-slate-800 dark:border-slate-200 text-xs font-bold z-50 flex items-center gap-2 pointer-events-none"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 animate-pulse shrink-0" />
            <span>{actionFeedback}</span>
          </motion.div>
        )}
      </div>

      {/* Map Footer Legends */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-4 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
            <span>Stable / Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
            <span>Warning / Slow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block"></span>
            <span>Critical / Congested</span>
          </div>
        </div>
        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
          GRID TELEMETRY FREQUENCY: 1.0 HZ
        </div>
      </div>
    </div>
  );
}
