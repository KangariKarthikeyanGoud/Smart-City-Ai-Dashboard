import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ReferenceArea, ReferenceLine } from 'recharts';
import { Navigation, Clock, ShieldAlert, CheckCircle, ArrowRight, Activity, TrendingUp } from 'lucide-react';

interface TrafficTabProps {
  trafficData: any;
  loading: boolean;
}

export default function TrafficTab({ trafficData, loading }: TrafficTabProps) {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  // High fidelity simulated datasets for Daily, Weekly and Monthly comparisons
  const dailyData = [
    { name: 'Mon', congestion: 52, speed: 42, count: 1800 },
    { name: 'Tue', congestion: 58, speed: 38, count: 1950 },
    { name: 'Wed', congestion: 65, speed: 32, count: 2100 },
    { name: 'Thu', congestion: 62, speed: 35, count: 2050 },
    { name: 'Fri', congestion: 70, speed: 28, count: 2400 },
    { name: 'Sat', congestion: 35, speed: 55, count: 1200 },
    { name: 'Sun', congestion: 28, speed: 60, count: 950 }
  ];

  const monthlyForecast = [
    { name: 'Wk 1', average: 51, peak: 82 },
    { name: 'Wk 2', average: 54, peak: 88 },
    { name: 'Wk 3', average: 58, peak: 94 },
    { name: 'Wk 4', average: 49, peak: 79 }
  ];

  return (
    <div className="space-y-6" id="traffic_analytics_tab">
      
      {/* Upper AI Prediction Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-5 rounded-2xl text-white shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-indigo-100 font-bold uppercase tracking-wider">AI Traffic Predictor</span>
            <h3 className="text-xl font-black mt-1">Next Peak Rush Hour</h3>
            <p className="text-sm text-indigo-100 mt-2">Predicted Congestion Peak in downtown Sectors: **08:15 AM - 09:45 AM** tomorrow.</p>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-mono bg-indigo-700/40 px-3 py-1.5 rounded-lg w-fit">
            <Clock className="w-3.5 h-3.5" />
            Accuracy Index: 94.2% (Trained Model)
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Estimated Delay Variance</span>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">+14 Mins</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Downtown commute multiplier currently sitting at **1.85x** over standard transit times.</p>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-amber-600 dark:text-amber-400 font-semibold">
            <TrendingUp className="w-4 h-4 animate-bounce" />
            Upward trend expected due to weekend dining
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Active Diversions</span>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">2 Routes Active</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Signals automatically synchronized on Greenwood Bypass to accommodate diverted commuters.</p>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle className="w-4 h-4" />
            Smart grids synchronized
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time Hourly Chart */}
        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Live Congestion Curve & Speed Trends</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Hourly vehicle metrics compiled from central road induction loops.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Toggle switch for AI Heatmap Overlay */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Heatmap</span>
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    showHeatmap ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                  id="ai_heatmap_overlay_toggle"
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      showHeatmap ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full block"></span> Congestion %
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-[#f43f5e] rounded-full block"></span> Avg Speed
                </span>
                {showHeatmap && (
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-1.5 border-t-2 border-dashed border-pink-500 block"></span> AI Forecast
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">Loading telemetry graph...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={(trafficData?.hourlyCongestion || []).map((item: any, idx: number) => ({
                    ...item,
                    predictedCongestion: Math.max(0, Math.min(100, Math.round(item.congestion * 1.07 + Math.sin(idx * 0.9) * 5)))
                  }))}
                >
                  <defs>
                    <linearGradient id="colorCongestion" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  {/* Heatmap Reference Bands behind the chart */}
                  {showHeatmap && (
                    <ReferenceArea 
                      y1={70} 
                      y2={100} 
                      {...{ fill: "#ef4444", fillOpacity: 0.07 }} 
                      label={{ value: "🔴 CRITICAL QUEUE", position: "insideTopLeft", fill: "#ef4444", fontSize: 8, fontWeight: "bold", opacity: 0.6 } as any} 
                    />
                  )}
                  {showHeatmap && (
                    <ReferenceArea 
                      y1={35} 
                      y2={70} 
                      {...{ fill: "#f59e0b", fillOpacity: 0.04 }} 
                      label={{ value: "🟡 QUEUE BUILDUP", position: "insideTopLeft", fill: "#f59e0b", fontSize: 8, fontWeight: "bold", opacity: 0.6 } as any} 
                    />
                  )}
                  {showHeatmap && (
                    <ReferenceArea 
                      y1={0} 
                      y2={35} 
                      {...{ fill: "#10b981", fillOpacity: 0.02 }} 
                      label={{ value: "🟢 CRUISE REGIME", position: "insideTopLeft", fill: "#10b981", fontSize: 8, fontWeight: "bold", opacity: 0.6 } as any} 
                    />
                  )}

                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800/40" />
                  <XAxis dataKey="time" style={{ fontSize: '10px' }} stroke="#94a3b8" />
                  <YAxis style={{ fontSize: '10px' }} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="congestion" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCongestion)" name="Congestion Level" />
                  <Area type="monotone" dataKey="speed" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorSpeed)" name="Speed (km/h)" />
                  
                  {showHeatmap && (
                    <Area type="monotone" dataKey="predictedCongestion" stroke="#ec4899" strokeWidth={2.5} strokeDasharray="4 4" fill="none" name="AI Predicted Congestion" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Weekly Comparison Forecast */}
        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Weekly Congestion Profile</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Historical averages used to program smart signal intervals.</p>
            
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800/20" />
                  <XAxis dataKey="name" style={{ fontSize: '9px' }} stroke="#94a3b8" />
                  <YAxis style={{ fontSize: '9px' }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="congestion" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Congestion %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 mt-4">
            📊 <strong>Model Insights:</strong> Saturday/Sunday average vehicle count falls by **45%** compared to standard industrial weekday loads.
          </div>
        </div>
      </div>

      {/* Suggested Smart Alternate Routes */}
      <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">AI Intelligent Routing Recommendations</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Real-time alternative pathways calculated to reduce city-wide gridlock.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Origin / Dest</th>
                <th className="py-3 px-4">Standard Route</th>
                <th className="py-3 px-4">Suggested Alternate</th>
                <th className="py-3 px-4 text-center">Standard vs Alt Time</th>
                <th className="py-3 px-4 text-right">AI Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {trafficData?.alternateRoutes?.map((route: any) => (
                <tr 
                  key={route.id}
                  onClick={() => setSelectedRoute(route.id)}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-900/30 cursor-pointer transition-colors ${selectedRoute === route.id ? 'bg-indigo-50/40 dark:bg-indigo-950/10' : ''}`}
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {route.from} &rarr; {route.to}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{route.standardRoute}</td>
                  <td className="py-3.5 px-4 text-indigo-600 dark:text-indigo-400 font-semibold">{route.alternate}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-rose-500 font-semibold">{route.standardTime}</span>
                    <span className="text-slate-400 mx-2">vs</span>
                    <span className="text-emerald-500 font-bold">{route.alternateTime}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {route.recommended ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-full font-bold text-[10px]">
                        Divert (Save {route.savings})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded-full text-[10px]">
                        Maintain Route
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
  );
}
