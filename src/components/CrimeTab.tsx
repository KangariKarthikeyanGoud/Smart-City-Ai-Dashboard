import React from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { Shield, MapPin, AlertCircle, CheckCircle2, Award, Calendar, ShieldCheck } from 'lucide-react';

interface CrimeTabProps {
  crimeData: any;
  loading: boolean;
}

export default function CrimeTab({ crimeData, loading }: CrimeTabProps) {
  
  // Custom colors for different crime categories
  const COLORS = ['#a855f7', '#f43f5e', '#ec4899', '#ef4444', '#3b82f6'];

  const simulatedHistory = [
    { day: 'Day 1', incidents: 14 },
    { day: 'Day 5', incidents: 18 },
    { day: 'Day 10', incidents: 12 },
    { day: 'Day 15', incidents: 22 },
    { day: 'Day 20', incidents: 9 },
    { day: 'Day 25', incidents: 15 },
    { day: 'Day 30', incidents: 8 }
  ];

  return (
    <div className="space-y-6" id="crime_analytics_tab">
      
      {/* Upper AI Security Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-2xl text-white shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-purple-100 font-bold uppercase tracking-wider">Predictive Security Engine</span>
            <h3 className="text-xl font-black mt-1">High Risk Probability</h3>
            <p className="text-sm text-purple-100 mt-2">AI forecasts an elevated larceny risk (**+15%**) in **Sector E (Waterfront)** around yacht clubs during weekend dining peaks.</p>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-mono bg-purple-700/40 px-3 py-1.5 rounded-lg w-fit">
            <Shield className="w-3.5 h-3.5 animate-pulse" />
            Precinct 3 Patrols Notified
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">City Safety Rating</span>
            <div className="flex items-end gap-3 mt-1">
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">89.4 / 100</h3>
              <span className="text-xs text-emerald-500 font-semibold mb-1">Excellent (Low Risk)</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-mono">
            CRIME INCIDENCE RATIO DECREASED 4.2% MONTH-OVER-MONTH
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Case Resolution Rating</span>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">82.5%</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fast tracking through AI dispatch tools has reduced average officer arrival times from 7.5 mins to **4.8 mins**.</p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/50 rounded-lg text-[10px] text-emerald-600 dark:text-emerald-400 font-bold w-fit mt-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Best in Class Dispatch
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Crime category distribution chart */}
        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Reported Category Distribution</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Summary count of reported incidents by type over the last 30 days.</p>
            </div>
          </div>

          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">Loading telemetry graph...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crimeData?.distribution || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800/40" />
                  <XAxis dataKey="category" style={{ fontSize: '10px' }} stroke="#94a3b8" />
                  <YAxis style={{ fontSize: '10px' }} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]}>
                    {crimeData?.distribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Crime Trend Curve */}
        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">30-Day Incidence Curve</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Historical index of daily dispatch logs.</p>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulatedHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800/20" />
                  <XAxis dataKey="day" style={{ fontSize: '8px' }} stroke="#94a3b8" />
                  <YAxis style={{ fontSize: '9px' }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="incidents" stroke="#a855f7" strokeWidth={2.5} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 mt-4">
            👮 <strong>Officer Patrol Tip:</strong> Saturated surveillance around Sector A subway block has reduced pickpocket reports by **32%** since June.
          </div>
        </div>
      </div>

      {/* Sector Trends resolution rates table */}
      <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">District Crime Index & Patrol Resolution Rates</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">A summary of localized incidents and resolution indexes compiled by police precincts.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Municipal Sector</th>
                <th className="py-3 px-4">Incidents Reported (30 Days)</th>
                <th className="py-3 px-4">High Severity count</th>
                <th className="py-3 px-4 text-center">Patrol Resolution Rate</th>
                <th className="py-3 px-4 text-right">District Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {crimeData?.sectorTrends?.map((sec: any) => (
                <tr key={sec.sector} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{sec.sector}</td>
                  <td className="py-3.5 px-4 font-mono font-medium">{sec.total}</td>
                  <td className="py-3.5 px-4 font-mono text-rose-500 font-bold">{sec.highSeverity}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${sec.resolvedRate}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold">{sec.resolvedRate}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {sec.resolvedRate > 80 ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold text-[9px] border border-emerald-100 dark:border-emerald-900/30">
                        Secure
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 font-bold text-[9px] border border-amber-100 dark:border-amber-900/30">
                        Patrol Saturated
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
