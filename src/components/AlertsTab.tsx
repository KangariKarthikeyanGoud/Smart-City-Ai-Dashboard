import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, Radio, PhoneCall, CheckCircle2, Siren, UserCheck, Flame, ShieldAlert, Zap, Compass, CloudRain
} from 'lucide-react';
import { Alert } from '../types';

interface AlertsTabProps {
  alerts: Alert[];
  loading: boolean;
  onResolveAlert: (id: string) => void;
  onTriggerAlert: (alert: { type: string; sector: string; description: string; severity: string }) => void;
}

export default function AlertsTab({ alerts, loading, onResolveAlert, onTriggerAlert }: AlertsTabProps) {
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosType, setSosType] = useState('Accident');
  const [sosSector, setSosSector] = useState('Sector A (Downtown)');
  const [sosDesc, setSosDesc] = useState('');
  const [sosSeverity, setSosSeverity] = useState('Critical');

  const emergencyContacts = [
    { name: 'Central Fire Dispatch', phone: '911 (Ext. 102)', status: 'Active' },
    { name: 'Police Precinct Central', phone: '911 (Ext. 105)', status: 'Active' },
    { name: 'Metropolis Trauma Hospital', phone: '911 (Ext. 109)', status: 'Active' },
    { name: 'Water & Gas Outage Hotline', phone: '1-800-555-0199', status: 'Active' },
    { name: 'Grid Power Failure Service', phone: '1-800-555-0155', status: 'Active' }
  ];

  const handleTriggerSOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sosDesc.trim()) return;

    onTriggerAlert({
      type: sosType,
      sector: sosSector,
      description: sosDesc,
      severity: sosSeverity
    });

    setSosDesc('');
    setShowSosModal(false);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'Fire': return Flame;
      case 'Power Failure': return Zap;
      case 'Flood':
      case 'Storm': return CloudRain;
      default: return Siren;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'SOS':
      case 'Critical': return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200';
    }
  };

  return (
    <div className="space-y-6" id="alerts_emergency_desk">
      
      {/* Panic Launcher Button */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 p-6 rounded-3xl text-white shadow-lg border border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="p-4 bg-white/10 rounded-2xl animate-pulse">
            <Siren className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide uppercase">Metropolis SOS Dispatch Deck</h2>
            <p className="text-xs text-rose-100 mt-1 max-w-lg">
              Trigger instant sirens, notify county firefighters, automatically reroute traffic, and broadcast localized push notifications to civilian cells instantly.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setShowSosModal(true)}
          className="px-6 py-3.5 bg-white text-rose-700 hover:bg-rose-50 transition-transform font-bold text-sm tracking-wider rounded-xl uppercase shadow-md hover:scale-[1.02] cursor-pointer"
        >
          🚨 Launch Emergency Alert
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Alerts Queue */}
        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Live Catastrophe Queue</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Unresolved events requiring dispatcher acknowledgment.</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-1 bg-red-50 text-red-600 dark:bg-red-950/25 rounded">
              {alerts.filter(a => !a.resolved).length} ACTIVE DISPATCHES
            </span>
          </div>

          <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400 font-mono">Loading telemetry dispatches...</div>
            ) : alerts.filter(a => !a.resolved).length === 0 ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <span className="text-xs font-semibold">City is secure. Zero active dispatches.</span>
              </div>
            ) : (
              <AnimatePresence>
                {alerts.filter(a => !a.resolved).map((alert) => {
                  const Icon = getAlertIcon(alert.type);
                  return (
                    <motion.div
                      key={alert.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="p-4 bg-slate-50 dark:bg-[#1f202e] border border-slate-100 dark:border-slate-800 rounded-xl flex items-start justify-between gap-4"
                    >
                      <div className="flex gap-3">
                        <div className="p-2.5 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] text-slate-400">{alert.id}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getSeverityBadge(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            <span className="text-slate-400 text-[10px]">•</span>
                            <span className="text-slate-700 dark:text-slate-300 font-bold text-xs">{alert.type}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{alert.description}</p>
                          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-400">
                            <Compass className="w-3.5 h-3.5" />
                            <span>Location Area: {alert.sector}</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => onResolveAlert(alert.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[10px] font-bold uppercase shrink-0 transition-colors cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Acknowledge
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Emergency Contacts & Phone Directories */}
        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">First Responder Directory</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Hotline contacts configured for central routing.</p>

            <div className="space-y-4">
              {emergencyContacts.map((contact) => (
                <div key={contact.name} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block">{contact.name}</span>
                    <span className="font-mono text-slate-400 text-[10px]">{contact.phone}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 mt-6">
            ⚠️ <strong>SOP Protocol:</strong> Direct lines are restricted for municipal administrators. Standard dial registers route automatically.
          </div>
        </div>
      </div>

      {/* SOS Alert Modal */}
      {showSosModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#1a1b26] w-full max-w-md p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Broadcast City Emergency</h3>
              <button 
                onClick={() => setShowSosModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleTriggerSOS} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 font-bold block mb-1">Catastrophe Type</label>
                <select 
                  value={sosType} 
                  onChange={(e) => setSosType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  <option>Fire</option>
                  <option>Flood</option>
                  <option>Accident</option>
                  <option>Medical</option>
                  <option>Power Failure</option>
                  <option>Earthquake</option>
                  <option>Storm</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-bold block mb-1">Impact Sector Location</label>
                <select 
                  value={sosSector} 
                  onChange={(e) => setSosSector(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  <option>Sector A (Downtown)</option>
                  <option>Sector B (Industrial)</option>
                  <option>Sector C (Residential East)</option>
                  <option>Sector D (Suburbs West)</option>
                  <option>Sector E (Waterfront)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-bold block mb-1">Dispatch Severity</label>
                <select 
                  value={sosSeverity} 
                  onChange={(e) => setSosSeverity(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>Critical</option>
                  <option>SOS</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-bold block mb-1">Brief Description</label>
                <textarea 
                  required
                  placeholder="e.g. Structural water main rupture flooding local subway lines..."
                  value={sosDesc}
                  onChange={(e) => setSosDesc(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button"
                  onClick={() => setShowSosModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  🚨 Trigger Broadcast
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
