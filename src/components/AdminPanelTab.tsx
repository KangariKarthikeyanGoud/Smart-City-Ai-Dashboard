import React from 'react';
import { motion } from 'motion/react';
import { Shield, Eye, Settings, ToggleLeft, AlertTriangle, Cpu, CheckCircle2, UserCheck } from 'lucide-react';
import { Sensor, UserRole } from '../types';

interface AdminPanelTabProps {
  sensors: Sensor[];
  currentRole: UserRole;
  onChangeSensorStatus: (id: string, status: 'Online' | 'Offline' | 'Maintenance') => void;
  auditLogs?: any[];
}

export default function AdminPanelTab({ sensors, currentRole, onChangeSensorStatus, auditLogs = [] }: AdminPanelTabProps) {
  
  // Custom helper to check write permissions
  const hasWritePermission = ['Super Admin', 'City Commissioner', 'Traffic Department', 'Police', 'Water Department'].includes(currentRole);

  const rolePrivileges = {
    'Super Admin': { read: true, write: true, calibrate: true, sos: true, description: 'Unrestricted master access. Complete operational override.' },
    'City Commissioner': { read: true, write: true, calibrate: false, sos: true, description: 'Executive read-write. Authorized for SOS broadcasts and reports.' },
    'Traffic Department': { read: true, write: true, calibrate: true, sos: false, description: 'Restricted write. Authorized for traffic signals and congestion loop controls.' },
    'Police': { read: true, write: true, calibrate: true, sos: true, description: 'Authorized for crime dispatches and SOS panic launchers.' },
    'Water Department': { read: true, write: true, calibrate: true, sos: false, description: 'Restricted write. Calibrate pressure grids and acoustic pipeline sensors.' },
    'Public User': { read: true, write: false, calibrate: false, sos: false, description: 'General public citizen readout. Read-only permissions.' }
  }[currentRole];

  return (
    <div className="space-y-6" id="admin_sensor_panel_tab">
      
      {/* Role and Permissions overview card */}
      <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex gap-4 items-center">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 rounded-2xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Access Registry Profile</span>
              <span className="px-2 py-0.5 bg-indigo-600 text-white rounded font-bold text-[9px] uppercase tracking-widest">{currentRole}</span>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
              {rolePrivileges.write ? 'Executive Management Controls Active' : 'Read-Only Municipal Observer Portal'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
              {rolePrivileges.description}
            </p>
          </div>
        </div>

        <div className="flex gap-2 text-[10px] font-bold tracking-wider uppercase">
          <span className={`px-2.5 py-1 rounded-full border ${rolePrivileges.read ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>Read Access</span>
          <span className={`px-2.5 py-1 rounded-full border ${rolePrivileges.write ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-400 border-red-200'}`}>Write Access</span>
          <span className={`px-2.5 py-1 rounded-full border ${rolePrivileges.sos ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-400 border-red-200'}`}>SOS Broadcast</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sensor Calibration Grid table */}
        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-2 flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Municipal Sensory Nodes Calibration</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Update status toggles for core traffic and air telemetry nodes.</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[9px] tracking-wider">
                    <th className="py-2.5 px-3">Node ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Sector Location</th>
                    <th className="py-2.5 px-3">Ping</th>
                    <th className="py-2.5 px-3 text-right">Node Calibration Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {sensors.map((sensor) => (
                    <tr key={sensor.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">{sensor.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-indigo-600 dark:text-indigo-400">{sensor.type}</td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">{sensor.sector}</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">Stable</td>
                      <td className="py-2.5 px-3 text-right">
                        {hasWritePermission ? (
                          <div className="flex gap-1 justify-end">
                            <button 
                              onClick={() => onChangeSensorStatus(sensor.id, 'Online')}
                              className={`px-1.5 py-0.5 text-[9px] font-bold rounded cursor-pointer border ${sensor.status === 'Online' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
                            >
                              ON
                            </button>
                            <button 
                              onClick={() => onChangeSensorStatus(sensor.id, 'Maintenance')}
                              className={`px-1.5 py-0.5 text-[9px] font-bold rounded cursor-pointer border ${sensor.status === 'Maintenance' ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
                            >
                              MAINT
                            </button>
                            <button 
                              onClick={() => onChangeSensorStatus(sensor.id, 'Offline')}
                              className={`px-1.5 py-0.5 text-[9px] font-bold rounded cursor-pointer border ${sensor.status === 'Offline' ? 'bg-rose-500 text-white border-rose-600' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
                            >
                              OFF
                            </button>
                          </div>
                        ) : (
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold border ${sensor.status === 'Online' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-200'}`}>
                            {sensor.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Audit Log Panel */}
        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Central Node Activity Logs</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Real-time telemetry audit trails.</p>

            <div className="space-y-4 font-mono text-[10px]">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="border-l-2 border-indigo-500 pl-3 py-0.5">
                  <div className="flex justify-between text-slate-400 text-[9px]">
                    <span>{log.time} • {log.user}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-semibold mt-0.5">{log.action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100 dark:border-indigo-900/30 text-[10px] font-medium text-indigo-700 dark:text-indigo-400 leading-normal mt-6">
            🔒 System security protocols compliant with ISO 27001 standard frameworks. Core node streams are fully encrypted.
          </div>
        </div>
      </div>

    </div>
  );
}
