/**
 * Metropolis Prime central smart city dashboard orchestrator.
 * Integrates visual components, role-based controls, maps synchronization,
 * and background telemetry fetches.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Map, LayoutDashboard, Navigation, Wind, Droplets, 
  ShieldAlert, AlertTriangle, BarChart3, Settings, Sun, Moon, 
  UserCheck, Shield, RefreshCw, MessageSquare
} from 'lucide-react';
import { UserRole, OverviewData, Alert, Sensor } from './types';

// Custom tabs components
import InteractiveMap from './components/InteractiveMap';
import DashboardTab from './components/DashboardTab';
import TrafficTab from './components/TrafficTab';
import PollutionTab from './components/PollutionTab';
import WaterTab from './components/WaterTab';
import CrimeTab from './components/CrimeTab';
import AlertsTab from './components/AlertsTab';
import AnalyticsTab from './components/AnalyticsTab';
import AdminPanelTab from './components/AdminPanelTab';
import ChatAssistant from './components/ChatAssistant';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('City Commissioner');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Datasets from the server APIs
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [traffic, setTraffic] = useState<any>(null);
  const [pollution, setPollution] = useState<any>(null);
  const [water, setWater] = useState<any>(null);
  const [crime, setCrime] = useState<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Audit logs state (maintains the last 10 administrative actions in real-time)
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { time: '10:14 AM', user: 'Super Admin', action: 'Synchronized traffic loops on Greenwood Bypass' },
    { time: '09:42 AM', user: 'Water Dept', action: 'Initiated acoustic pipeline leak calibration near Sector B' },
    { time: '08:11 AM', user: 'Police Precinct 3', action: 'Resolved minor accident alert ALT-100204' },
    { time: '07:30 AM', user: 'Commissioner', action: 'Exported monthly municipal carbon telemetry' }
  ]);

  const addAuditLog = (actionText: string) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAuditLogs(prev => {
      const newLog = {
        time: formattedTime,
        user: currentRole,
        action: actionText
      };
      // Keep only the last 10 actions
      return [newLog, ...prev].slice(0, 10);
    });
  };

  // Toggle collapsible floating chat
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  // Load all telemetry from Express endpoints
  const fetchAllTelemetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resOverview, resTraffic, resPollution, resWater, resCrime, resAlerts] = await Promise.all([
        fetch('/api/city-overview'),
        fetch('/api/traffic'),
        fetch('/api/pollution'),
        fetch('/api/water'),
        fetch('/api/crime'),
        fetch('/api/alerts')
      ]);

      if (!resOverview.ok || !resTraffic.ok || !resPollution.ok || !resWater.ok || !resCrime.ok || !resAlerts.ok) {
        throw new Error('Some sensory telemetry streams are failing.');
      }

      const dOverview = await resOverview.json();
      const dTraffic = await resTraffic.json();
      const dPollution = await resPollution.json();
      const dWater = await resWater.json();
      const dCrime = await resCrime.json();
      const dAlerts = await resAlerts.json();

      setOverview(dOverview);
      setTraffic(dTraffic);
      setPollution(dPollution);
      setWater(dWater);
      setCrime(dCrime);
      setAlerts(dAlerts);
    } catch (err: any) {
      console.error('Error fetching municipal streams:', err);
      setError('A connection delay was encountered between the central sensory servers. Please ensure port 3000 is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTelemetry();
    
    // Auto-refresh stats every 45 seconds for active simulation feel
    const interval = setInterval(fetchAllTelemetry, 45000);
    return () => clearInterval(interval);
  }, []);

  // Sync dark mode class on html node
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle marking an alert resolved
  const handleResolveAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}/resolve`, { method: 'POST' });
      if (res.ok) {
        addAuditLog(`Acknowledged / Resolved emergency alert ${id}`);
        // Optimistic state updates
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
        if (overview) {
          setOverview({
            ...overview,
            activeAlertsCount: Math.max(0, overview.activeAlertsCount - 1),
            recentAlerts: overview.recentAlerts.map(a => a.id === id ? { ...a, resolved: true } : a)
          });
        }
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  // Handle triggering a new alert
  const handleTriggerAlert = async (alertPayload: { type: string; sector: string; description: string; severity: string }) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertPayload)
      });
      if (res.ok) {
        const data = await res.json();
        addAuditLog(`Broadcasted emergency dispatch ${data.alert.id} (${alertPayload.type}) in ${alertPayload.sector}`);
        // Insert new alert
        setAlerts(prev => [data.alert, ...prev]);
        if (overview) {
          setOverview({
            ...overview,
            activeAlertsCount: overview.activeAlertsCount + 1,
            recentAlerts: [data.alert, ...overview.recentAlerts.slice(0, 4)]
          });
        }
        setActiveTab('alerts');
      }
    } catch (err) {
      console.error('Failed to trigger alert:', err);
    }
  };

  // Handle changing sensor status
  const handleChangeSensorStatus = async (id: string, status: 'Online' | 'Offline' | 'Maintenance') => {
    try {
      const res = await fetch(`/api/sensors/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        addAuditLog(`Calibrated sensor node ${id} status to ${status.toUpperCase()}`);
        // Update in state
        if (overview) {
          const updatedSensors = overview.sensors.map(s => s.id === id ? { ...s, status } : s);
          const onlineCount = updatedSensors.filter(s => s.status === 'Online').length;
          setOverview({
            ...overview,
            sensors: updatedSensors,
            onlineSensorsCount: onlineCount
          });
        }
      }
    } catch (err) {
      console.error('Failed to update sensor:', err);
    }
  };

  const roles: UserRole[] = [
    'Super Admin', 
    'City Commissioner', 
    'Traffic Department', 
    'Police', 
    'Water Department', 
    'Public User'
  ];

  const sidebarTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'traffic', label: 'Traffic Predict', icon: Navigation },
    { id: 'pollution', label: 'Air & Pollution', icon: Wind },
    { id: 'water', label: 'Water Analytics', icon: Droplets },
    { id: 'crime', label: 'Security Intelligence', icon: ShieldAlert },
    { id: 'alerts', label: 'Dispatch Center', icon: AlertTriangle, count: overview?.activeAlertsCount || 0 },
    { id: 'analytics', label: 'Smart Reports', icon: BarChart3 },
    { id: 'admin', label: 'Sensors Admin', icon: Settings }
  ];

  return (
    <div className={`min-h-screen font-sans antialiased text-slate-800 dark:text-slate-200 transition-colors duration-200 bg-slate-50 dark:bg-[#0f111a]`} id="smart_city_app_root">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#121420]/95 backdrop-blur border-b border-slate-100 dark:border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-slate-900 dark:text-white uppercase">Metropolis Prime</h1>
            <span className="text-[10px] font-mono font-bold text-indigo-500 block leading-tight">CENTRAL INTELLIGENCE DESK</span>
          </div>
        </div>

        {/* Header Right Elements */}
        <div className="flex items-center gap-3.5">
          
          {/* Active Role Selector dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#1a1c2b] px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="bg-transparent border-none text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {roles.map(r => (
                <option key={r} value={r} className="dark:bg-[#121420] text-slate-700 dark:text-slate-200">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Theme switcher */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-slate-50 dark:bg-[#1f2136] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-indigo-400 transition-colors cursor-pointer border border-slate-200/40 dark:border-slate-800"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side Sidebar Tab Selectors */}
        <aside className="lg:col-span-3 space-y-2 shrink-0">
          <div className="bg-white dark:bg-[#121420] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-3">COMMAND DECK</h2>
            
            <nav className="space-y-1">
              {sidebarTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/15' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1a1c2b] hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isActive ? 'bg-white text-indigo-600' : 'bg-rose-500 text-white animate-pulse'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Floating AI Status card inside sidebar */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-4 rounded-2xl text-white shadow-sm border border-indigo-800/30">
            <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-300">Central Brain</span>
            <h4 className="font-bold text-sm text-slate-100 mt-1 flex items-center gap-1">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              Metropolis Central Core
            </h4>
            <p className="text-[10px] text-slate-300 mt-2 leading-relaxed">
              Google Gemini is actively modeling civilian schedules and pipeline pressures to deliver real-time municipal routing and load shedding optimizations.
            </p>
          </div>
        </aside>

        {/* Center / Right Content Grid layout */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Connection Error Banner */}
          {error && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-center justify-between gap-4">
              <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">{error}</span>
              <button 
                onClick={fetchAllTelemetry}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reconnect
              </button>
            </div>
          )}

          {/* Interactive Map Section (Persistent or Toggled beautifully next to the specific sub-analytics) */}
          <div className="grid grid-cols-1 gap-6">
            {/* Always mount the gorgeous map overlay except for Analytics and Settings tabs to keep the interface highly focused! */}
            {activeTab !== 'analytics' && activeTab !== 'admin' && (
              <InteractiveMap 
                activeTab={activeTab}
                trafficData={traffic}
                pollutionData={pollution}
                waterData={water}
                crimeData={crime}
                alertsData={alerts}
              />
            )}

            {/* Render selected command deck sub-tab panel */}
            <div className="transition-all duration-300">
              {activeTab === 'dashboard' && (
                <DashboardTab 
                  data={overview}
                  loading={loading}
                  onRefresh={fetchAllTelemetry}
                  onSwitchTab={setActiveTab}
                />
              )}
              {activeTab === 'traffic' && (
                <TrafficTab 
                  trafficData={traffic} 
                  loading={loading} 
                />
              )}
              {activeTab === 'pollution' && (
                <PollutionTab 
                  pollutionData={pollution} 
                  loading={loading} 
                />
              )}
              {activeTab === 'water' && (
                <WaterTab 
                  waterData={water} 
                  loading={loading} 
                />
              )}
              {activeTab === 'crime' && (
                <CrimeTab 
                  crimeData={crime} 
                  loading={loading} 
                />
              )}
              {activeTab === 'alerts' && (
                <AlertsTab 
                  alerts={alerts}
                  loading={loading}
                  onResolveAlert={handleResolveAlert}
                  onTriggerAlert={handleTriggerAlert}
                />
              )}
              {activeTab === 'analytics' && (
                <AnalyticsTab 
                  trafficData={traffic}
                  pollutionData={pollution}
                  waterData={water}
                  crimeData={crime}
                  addAuditLog={addAuditLog}
                />
              )}
              {activeTab === 'admin' && (
                <AdminPanelTab 
                  sensors={overview?.sensors || []}
                  currentRole={currentRole}
                  onChangeSensorStatus={handleChangeSensorStatus}
                  auditLogs={auditLogs}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Floating Collapsible Conversational AI Chatbox - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {chatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="mb-4 w-[360px] md:w-[400px] shadow-2xl rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <ChatAssistant currentRole={currentRole} />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`p-4 rounded-full text-white shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 cursor-pointer ${chatOpen ? 'bg-rose-600' : 'bg-indigo-600'}`}
        >
          {chatOpen ? (
            <span className="text-sm font-bold px-1 uppercase tracking-wide">Close Central AI</span>
          ) : (
            <>
              <MessageSquare className="w-5 h-5 text-white" />
              <span className="text-xs font-bold uppercase tracking-wider pr-1">Metropolis Central AI</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
