import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, Activity, Wind, Droplets, ShieldAlert, Zap, CloudSun, AlertCircle, RefreshCw, Radio
} from 'lucide-react';
import { OverviewData } from '../types';

interface DashboardTabProps {
  data: OverviewData | null;
  loading: boolean;
  onRefresh: () => void;
  onSwitchTab: (tab: string) => void;
}

export default function DashboardTab({ data, loading, onRefresh, onSwitchTab }: DashboardTabProps) {
  // Safe defaults
  const stats = [
    {
      id: 'pop',
      title: 'Active Population',
      value: '1,424,510',
      change: '+1.2% this hour',
      isGood: true,
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400',
      actionLabel: 'Demographics'
    },
    {
      id: 'traffic',
      title: 'Avg Congestion',
      value: `${data?.avgCongestion || 45}%`,
      change: data && data.avgCongestion > 50 ? 'Heavy Congestion' : 'Normal Congestion',
      isGood: data ? data.avgCongestion < 50 : true,
      icon: Activity,
      color: 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400',
      actionLabel: 'Route Analytics',
      tab: 'traffic'
    },
    {
      id: 'aqi',
      title: 'Air Quality (AQI)',
      value: `${data?.avgAqi || 72}`,
      change: data && data.avgAqi > 100 ? 'Poor Air Index' : 'Moderate Air Index',
      isGood: data ? data.avgAqi < 100 : true,
      icon: Wind,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400',
      actionLabel: 'Air Reports',
      tab: 'pollution'
    },
    {
      id: 'water',
      title: 'Water Consumed',
      value: `${((data?.totalWaterConsumed || 450000) / 1000).toFixed(0)}K Liters`,
      change: 'Hourly municipality load',
      isGood: true,
      icon: Droplets,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
      actionLabel: 'Flow Sensors',
      tab: 'water'
    },
    {
      id: 'crime',
      title: 'Active Incidents',
      value: `${data?.unresolvedCrimes || 12}`,
      change: '88% Case Resolution',
      isGood: data ? data.unresolvedCrimes < 20 : true,
      icon: ShieldAlert,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400',
      actionLabel: 'Police Dispatch',
      tab: 'crime'
    },
    {
      id: 'power',
      title: 'Grid Power Usage',
      value: '420.5 MW',
      change: '89% generation capacity',
      isGood: true,
      icon: Zap,
      color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400',
      actionLabel: 'Energy Grids'
    },
    {
      id: 'weather',
      title: 'Weather Outlook',
      value: '24.2°C',
      change: 'Clear Sky / Humidity 62%',
      isGood: true,
      icon: CloudSun,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
      actionLabel: 'Detailed Forecast'
    }
  ];

  return (
    <div className="space-y-6" id="dashboard_tab_container">
      {/* Upper Status Bar */}
      <div className="flex justify-between items-center bg-white dark:bg-[#1a1b26] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div className="flex items-center gap-1">
            <Radio className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">CENTRAL SENSORY HUB ONLINE</span>
          </div>
        </div>

        <button 
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Core Telemetry
        </button>
      </div>

      {/* Primary KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{stat.title}</span>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} transition-all`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-50 dark:border-slate-800/50 pt-3">
              <span className={`text-[11px] font-medium ${stat.isGood ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                {stat.change}
              </span>
              {stat.tab && (
                <button 
                  onClick={() => onSwitchTab(stat.tab!)}
                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {stat.actionLabel} &rarr;
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {/* Emergency Alerts Indicator inside bento grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={() => onSwitchTab('alerts')}
          className={`p-5 rounded-2xl border flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.01] ${data && data.activeAlertsCount > 0 ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/50' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-rose-500 dark:text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Emergency Services
              </span>
              <h3 className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{data?.activeAlertsCount || 0}</h3>
            </div>
            <div className="p-2.5 bg-rose-500 text-white rounded-full animate-pulse">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3 border-t border-rose-100 dark:border-rose-950/20">
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold underline">
              {data && data.activeAlertsCount > 0 ? 'Broadcast is active. Click to deploy response units.' : 'No active catastrophes reported.'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Municipal Quick Alert Notification Banners */}
      {data && data.recentAlerts && data.recentAlerts.filter(a => !a.resolved).length > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300">CRITICAL DISPATCH ANNOUNCEMENT</h4>
            <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
              {data.recentAlerts.filter(a => !a.resolved)[0]?.description || 'Multiple municipal sensor nodes flagging high priority anomalies.'} (Sector: {data.recentAlerts.filter(a => !a.resolved)[0]?.sector})
            </p>
          </div>
          <button 
            onClick={() => onSwitchTab('alerts')}
            className="px-3 py-1 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
          >
            Deploy
          </button>
        </div>
      )}
    </div>
  );
}
