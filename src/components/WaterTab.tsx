import React from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, AlertCircle, ShieldAlert, CheckCircle, Flame, BatteryCharging, ShieldCheck } from 'lucide-react';

interface WaterTabProps {
  waterData: any;
  loading: boolean;
}

export default function WaterTab({ waterData, loading }: WaterTabProps) {
  
  // Pipeline status colors
  const getPipeStatusColor = (status: string) => {
    if (status === 'Optimal') return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
    if (status === 'Critical') return 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/30';
    return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
  };

  return (
    <div className="space-y-6" id="water_analytics_tab">
      
      {/* Upper AI Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-2xl text-white shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-blue-100 font-bold uppercase tracking-wider">Acoustic AI Leak Detector</span>
            <h3 className="text-xl font-black mt-1">Anomalous Flow Alert</h3>
            <p className="text-sm text-blue-100 mt-2">A high stress pressure drop (**-22% psi**) suggests a localized pipe leak near **Sector B Warehouse Row**.</p>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-mono bg-blue-700/40 px-3 py-1.5 rounded-lg w-fit">
            <AlertCircle className="w-3.5 h-3.5" />
            Leak Probability: 91% (Flagged)
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Main Reservoirs Level</span>
            <div className="flex items-end gap-3 mt-1">
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">84.2%</h3>
              <span className="text-xs text-emerald-500 font-semibold mb-1">Optimal Storage</span>
            </div>
            
            {/* Visual tank indicator */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '84.2%' }} />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
            No critical water shortages predicted for the upcoming 45 days.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Average Pipe Integrity</span>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">94.8%</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Surgical repairs scheduled for Sector B Pipeline 102 next Thursday to restore complete integrity index.</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/50 rounded-lg text-[10px] text-emerald-600 dark:text-emerald-400 font-bold w-fit mt-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Protected by Automated Cathodic grids
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time Consumption Chart */}
        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Diurnal Water Consumption Curve</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Hourly municipal water extraction (Liters) over the last 24 records.</p>
            </div>
          </div>

          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">Loading telemetry graph...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={waterData?.historicalLog?.slice(0, 24).reverse().map((w: any) => ({
                  time: new Date(w.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  consumption: w.consumption
                })) || []}>
                  <defs>
                    <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800/40" />
                  <XAxis dataKey="time" style={{ fontSize: '9px' }} stroke="#94a3b8" />
                  <YAxis style={{ fontSize: '9px' }} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="consumption" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWater)" name="Consumption (Liters)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Conservation & Storage Advisory Panel */}
        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Sustainable Conservation Tips</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Suggestions generated dynamically to promote green municipal scores.</p>

            <div className="space-y-3.5 text-xs">
              <div className="flex gap-2">
                <span className="text-indigo-500 font-bold shrink-0">1.</span>
                <span className="text-slate-600 dark:text-slate-400">Implement rainwater harvesting in **Sectors C & D** residential blocks to save up to **18%** of public water grid load.</span>
              </div>
              <div className="flex gap-2 border-t border-slate-50 dark:border-slate-800/40 pt-3">
                <span className="text-indigo-500 font-bold shrink-0">2.</span>
                <span className="text-slate-600 dark:text-slate-400">Deploy low-flow greywater dual piping in industrial washdowns (Sector B) to reduce overall sewer loading.</span>
              </div>
              <div className="flex gap-2 border-t border-slate-50 dark:border-slate-800/40 pt-3">
                <span className="text-indigo-500 font-bold shrink-0">3.</span>
                <span className="text-slate-600 dark:text-slate-400">Standardize drip-irrigation sensor arrays in municipal parks to prevent midday vaporization loss.</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 dark:bg-indigo-950/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold mt-4">
            🌳 <strong>Eco Goal:</strong> Save 100 million liters city-wide by the end of Q4 2026.
          </div>
        </div>
      </div>

      {/* Water Pipeline Node Table */}
      <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Arterial Pipeline Sensors</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Structural acoustics and pressure telemetries across sector pipelines.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Pipeline ID</th>
                <th className="py-3 px-4">Municipal Sector</th>
                <th className="py-3 px-4">Acoustic Integrity Index</th>
                <th className="py-3 px-4">Pressure Rating</th>
                <th className="py-3 px-4 text-center">Avg Flow Rate</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {waterData?.pipelines?.map((pipe: any) => (
                <tr key={pipe.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{pipe.id}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{pipe.sector}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${pipe.health > 80 ? 'bg-emerald-500' : (pipe.health > 50 ? 'bg-amber-500' : 'bg-rose-500')}`}
                          style={{ width: `${pipe.health}%` }}
                        />
                      </div>
                      <span className="font-mono font-semibold">{pipe.health}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">{pipe.pressure} psi</td>
                  <td className="py-3 px-4 text-center font-mono">{pipe.flowRate} L/s</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold border ${getPipeStatusColor(pipe.status)}`}>
                      {pipe.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
