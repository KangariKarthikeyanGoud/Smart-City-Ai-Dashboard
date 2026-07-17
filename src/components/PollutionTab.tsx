import React from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Wind, ShieldAlert, Heart, RefreshCw, Sun, AlertTriangle } from 'lucide-react';

interface PollutionTabProps {
  pollutionData: any;
  loading: boolean;
}

export default function PollutionTab({ pollutionData, loading }: PollutionTabProps) {
  
  // AQI level styling helper
  const getAqiStyle = (aqi: number) => {
    if (aqi <= 50) return { bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900', text: 'text-emerald-700 dark:text-emerald-400', label: 'Good' };
    if (aqi <= 100) return { bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900', text: 'text-amber-700 dark:text-amber-400', label: 'Moderate' };
    if (aqi <= 150) return { bg: 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900', text: 'text-orange-700 dark:text-orange-400', label: 'Unhealthy for Sensitive' };
    return { bg: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900', text: 'text-red-700 dark:text-red-400', label: 'Hazardous' };
  };

  const aqiRanges = [
    { range: '0 - 50', label: 'Good', color: '#10b981' },
    { range: '51 - 100', label: 'Moderate', color: '#f59e0b' },
    { range: '101 - 150', label: 'Unhealthy (Sens.)', color: '#f97316' },
    { range: '151 - 300+', label: 'Hazardous', color: '#ef4444' }
  ];

  return (
    <div className="space-y-6" id="pollution_tab_environmental">
      
      {/* Upper Alerts & Safety Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-5 rounded-2xl text-white shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-amber-100 font-bold uppercase tracking-wider">AI Pollution Forecast</span>
            <h3 className="text-xl font-black mt-1">PM2.5 Spikes Warning</h3>
            <p className="text-sm text-amber-100 mt-2">Due to high humidity and factory schedules, Sector B (Industrial) AQI is predicted to spike to **184** tomorrow afternoon.</p>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-mono bg-amber-700/40 px-3 py-1.5 rounded-lg w-fit">
            <AlertTriangle className="w-3.5 h-3.5" />
            Advisory issued to municipal school systems
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Health Risk Assessment</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              Moderate Respiratory Load
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Sensitive residents (asthma, seniors) should avoid the industrial perimeter in Sector B between 12:00 PM and 5:00 PM.</p>
          </div>
          <div className="text-[10px] text-slate-400 mt-3 font-mono">
            MEDICAL TRUST INDEX: 92%
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Safe / Danger Sectors</span>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">🟢 Safest Zone:</span>
                <span className="font-bold text-emerald-600">Suburbs West (AQI 35)</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-50 dark:border-slate-800 pt-2">
                <span className="text-slate-500">🔴 Danger Zone:</span>
                <span className="font-bold text-rose-600">Industrial Zone (AQI 168)</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider mt-4">
            Total active air nodes: 42
          </div>
        </div>
      </div>

      {/* AQI Breakdown by Sectors Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {pollutionData?.sectorAqi?.map((sec: any, idx: number) => {
          const style = getAqiStyle(sec.aqi);
          return (
            <motion.div
              key={sec.sector}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-xl border flex flex-col justify-between h-36 ${style.bg}`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {sec.sector.split(' ')[0]} {sec.sector.split(' ')[1] || ''}
                </span>
                <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{sec.aqi}</h4>
              </div>
              <div>
                <span className={`text-[11px] font-bold ${style.text}`}>{style.label}</span>
                <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 font-mono">
                  <span>PM2.5: {sec.pm25}</span>
                  <span>Temp: {sec.temp}°C</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Historical logs graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gas Pollutant Trends Chart */}
        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Historical Particulate & Gaseous Trends</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Live averages for Ozone, NO₂ and CO levels in Metropolis Prime.</p>
            </div>
          </div>

          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">Loading data feeds...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pollutionData?.historicalLog?.slice(0, 24).reverse() || []}>
                  <defs>
                    <linearGradient id="colorO3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800/40" />
                  <XAxis dataKey="timestamp" style={{ fontSize: '8px' }} tickFormatter={(tick) => new Date(tick).toLocaleTimeString([], { hour: '2-digit' })} stroke="#94a3b8" />
                  <YAxis style={{ fontSize: '9px' }} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                  />
                  <Area type="monotone" dataKey="o3" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorO3)" name="Ozone (ppb)" />
                  <Area type="monotone" dataKey="no2" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorNo2)" name="NO₂ (ppb)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AQI Indicator Index Panel */}
        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">AQI Health Index Ranges</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Standard municipal warning categories used globally.</p>

            <div className="space-y-4">
              {aqiRanges.map((range) => (
                <div key={range.label} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full block" style={{ backgroundColor: range.color }} />
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">{range.label}</span>
                  </div>
                  <span className="font-mono text-slate-400">{range.range}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 mt-4">
            💡 <strong>Quick Fact:</strong> Planting urban forests in Sector C has reduced its average PM10 levels by **14%** year-over-year.
          </div>
        </div>
      </div>

    </div>
  );
}
