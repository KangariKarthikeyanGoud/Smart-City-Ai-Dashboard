import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, FileText, Check, FileSpreadsheet, BarChart2 } from 'lucide-react';

interface AnalyticsTabProps {
  trafficData?: any;
  pollutionData?: any;
  waterData?: any;
  crimeData?: any;
  addAuditLog?: (action: string) => void;
}

export default function AnalyticsTab({ trafficData, pollutionData, waterData, crimeData, addAuditLog }: AnalyticsTabProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Comparative energy vs water dataset (Recharts dual area)
  const resourceComparison = [
    { time: '02:00', energy: 120, water: 80 },
    { time: '06:00', energy: 140, water: 95 },
    { time: '10:00', energy: 380, water: 280 },
    { time: '14:00', energy: 410, water: 240 },
    { time: '18:00', energy: 390, water: 310 },
    { time: '22:00', energy: 240, water: 150 }
  ];

  // Pie chart categories distribution
  const incidentCategories = crimeData?.distribution || [
    { category: 'Theft', count: 180 },
    { category: 'Accident', count: 240 },
    { category: 'Robbery', count: 90 },
    { category: 'Violence', count: 110 },
    { category: 'Fraud', count: 130 }
  ];

  const PIE_COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];

  // Universal real CSV exporter!
  const triggerCsvDownload = (datasetName: string, headers: string[], rows: any[][]) => {
    setDownloading(datasetName);
    
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(",")].concat(rows.map(e => e.join(","))).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `metropolis_${datasetName}_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(null);
    }, 800);
  };

  const handleExportTraffic = () => {
    const headers = ['Record_ID', 'Sector', 'Congestion_Level', 'Avg_Speed_kmh', 'Vehicle_Count', 'Timestamp'];
    const logs = trafficData?.recentRecords || [];
    const rows = logs.map((t: any) => [
      t.id,
      `"${t.sector}"`,
      t.congestionLevel,
      t.avgSpeed,
      t.vehicleCount,
      t.timestamp
    ]);
    triggerCsvDownload('traffic_congestion', headers, rows);
  };

  const handleExportPollution = () => {
    const headers = ['Record_ID', 'Sector', 'AQI', 'PM25', 'PM10', 'NO2', 'CO', 'SO2', 'Ozone', 'Timestamp'];
    const logs = pollutionData?.historicalLog || [];
    const rows = logs.map((p: any) => [
      p.id,
      `"${p.sector}"`,
      p.aqi,
      p.pm25,
      p.pm10,
      p.no2,
      p.co,
      p.so2,
      p.o3,
      p.timestamp
    ]);
    triggerCsvDownload('environmental_aqi', headers, rows);
  };

  const handleExportWater = () => {
    const headers = ['Record_ID', 'Sector', 'Consumption_Liters', 'Leak_Detected', 'Tank_Level_Pct', 'Pipeline_Health_Pct', 'Pressure_psi', 'Timestamp'];
    const logs = waterData?.historicalLog || [];
    const rows = logs.map((w: any) => [
      w.id,
      `"${w.sector}"`,
      w.consumption,
      w.leakDetected,
      w.tankLevel,
      w.pipelineHealth,
      w.pressure,
      w.timestamp
    ]);
    triggerCsvDownload('water_utilities', headers, rows);
  };

  return (
    <div className="space-y-6" id="analytics_downloads_tab">
      
      {/* Exporters and Reports panel */}
      <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Municipal Reports & Export Desk</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Generate and download actual compiled CSV spreadsheet telemetry logs.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={handleExportTraffic}
            disabled={downloading !== null}
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all group text-left cursor-pointer"
          >
            <div className="flex gap-3">
              <FileSpreadsheet className="w-5 h-5 text-indigo-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs block">Traffic Congestion Records</span>
                <span className="text-[10px] text-slate-400 font-mono">CSV • 1,000 logs</span>
              </div>
            </div>
            {downloading === 'traffic_congestion' ? (
              <Check className="w-4 h-4 text-emerald-500 animate-bounce" />
            ) : (
              <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            )}
          </button>

          <button 
            onClick={handleExportPollution}
            disabled={downloading !== null}
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all group text-left cursor-pointer"
          >
            <div className="flex gap-3">
              <FileSpreadsheet className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs block">Environmental Air AQI</span>
                <span className="text-[10px] text-slate-400 font-mono">CSV • 1,000 logs</span>
              </div>
            </div>
            {downloading === 'environmental_aqi' ? (
              <Check className="w-4 h-4 text-emerald-500 animate-bounce" />
            ) : (
              <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
            )}
          </button>

          <button 
            onClick={handleExportWater}
            disabled={downloading !== null}
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all group text-left cursor-pointer"
          >
            <div className="flex gap-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs block">Water Utility Pipeline Logs</span>
                <span className="text-[10px] text-slate-400 font-mono">CSV • 1,000 logs</span>
              </div>
            </div>
            {downloading === 'water_utilities' ? (
              <Check className="w-4 h-4 text-emerald-500 animate-bounce" />
            ) : (
              <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            )}
          </button>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Resource Comparison Area Chart */}
        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Cross-Utility Municipal Comparison</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Mapping peak daily electric grid load (MW) against municipal water flow (Kilo-Liters).</p>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resourceComparison}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800/20" />
                <XAxis dataKey="time" style={{ fontSize: '9px' }} stroke="#94a3b8" />
                <YAxis style={{ fontSize: '9px' }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ fontSize: '11px' }} />
                <Legend style={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2.5} name="Power Grid (MW)" />
                <Line type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={2.5} name="Water Flow (kL)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crime Share Pie Chart */}
        <div className="bg-white dark:bg-[#1a1b26] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Incident Proportions (30-Day Share)</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Percentage proportion by reported category.</p>

            <div className="h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incidentCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="category"
                  >
                    {incidentCategories.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} events`} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute font-sans text-center pointer-events-none">
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Metrics</span>
                <span className="text-lg font-black text-slate-800 dark:text-slate-200">Total Share</span>
              </div>
            </div>
          </div>

          {/* Pie Legends */}
          <div className="grid grid-cols-5 gap-2 border-t border-slate-50 dark:border-slate-800/40 pt-4 mt-4">
            {incidentCategories.map((entry: any, index: number) => (
              <div key={entry.category} className="text-center">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: PIE_COLORS[index] }} />
                <span className="text-[10px] text-slate-500 block truncate font-medium">{entry.category}</span>
                <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-300 block">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) with Drop-up Export Menu */}
      <div className="fixed bottom-24 right-6 md:right-8 z-40 flex flex-col items-end gap-2" id="floating_export_desk">
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-[#1a1b26] p-2.5 rounded-2xl shadow-2xl border border-slate-150 dark:border-slate-800 w-64 flex flex-col gap-1.5 mb-2 pointer-events-auto"
          >
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2 uppercase tracking-wider block mb-1">SELECT CHART DATASET</span>
            
            <button 
              onClick={() => {
                const headers = ['Record_ID', 'Sector', 'Congestion_Level', 'Avg_Speed_kmh', 'Vehicle_Count', 'Timestamp'];
                const rows = (trafficData?.recentRecords || []).map((t: any) => [t.id, `"${t.sector}"`, t.congestionLevel, t.avgSpeed, t.vehicleCount, t.timestamp]);
                triggerCsvDownload('traffic_congestion', headers, rows);
                addAuditLog?.('Exported Traffic Congestion Records (CSV)');
                setMenuOpen(false);
              }}
              disabled={downloading !== null}
              className="w-full text-left text-xs p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Traffic Congestion Logs</span>
            </button>

            <button 
              onClick={() => {
                const headers = ['Record_ID', 'Sector', 'AQI', 'PM25', 'PM10', 'Timestamp'];
                const rows = (pollutionData?.historicalLog || []).map((p: any) => [p.id, `"${p.sector}"`, p.aqi, p.pm25, p.pm10, p.timestamp]);
                triggerCsvDownload('environmental_aqi', headers, rows);
                addAuditLog?.('Exported Environmental AQI Records (CSV)');
                setMenuOpen(false);
              }}
              disabled={downloading !== null}
              className="w-full text-left text-xs p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Environmental Air AQI</span>
            </button>

            <button 
              onClick={() => {
                const headers = ['Record_ID', 'Sector', 'Consumption', 'Leak_Detected', 'Timestamp'];
                const rows = (waterData?.historicalLog || []).map((w: any) => [w.id, `"${w.sector}"`, w.consumption, w.leakDetected, w.timestamp]);
                triggerCsvDownload('water_utilities', headers, rows);
                addAuditLog?.('Exported Water Utility Logs (CSV)');
                setMenuOpen(false);
              }}
              disabled={downloading !== null}
              className="w-full text-left text-xs p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Water Pipelines Logs</span>
            </button>

            <div className="border-t border-slate-100 dark:border-slate-800/80 my-1"></div>

            <button 
              onClick={() => {
                const headers = ['Time', 'Power_Grid_MW', 'Water_Flow_kL'];
                const rows = resourceComparison.map(r => [r.time, r.energy, r.water]);
                triggerCsvDownload('cross_utility_comparison', headers, rows);
                addAuditLog?.('Exported Cross-Utility Municipal Comparison Chart (CSV)');
                setMenuOpen(false);
              }}
              disabled={downloading !== null}
              className="w-full text-left text-xs p-2 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 rounded-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 cursor-pointer"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Resource Grid Chart CSV</span>
            </button>

            <button 
              onClick={() => {
                const headers = ['Incident_Category', 'Incident_Count'];
                const rows = incidentCategories.map(r => [r.category, r.count]);
                triggerCsvDownload('incident_proportions', headers, rows);
                addAuditLog?.('Exported Incident Proportions Chart (CSV)');
                setMenuOpen(false);
              }}
              disabled={downloading !== null}
              className="w-full text-left text-xs p-2 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 rounded-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Incident Proportions CSV</span>
            </button>

            <button 
              onClick={() => {
                setDownloading('integrated_report');
                setTimeout(() => {
                  const csvLines = [
                    '# METROPOLIS PRIME INTEGRATED ANALYTICS CHART DATA',
                    '# GENERATED: ' + new Date().toLocaleString(),
                    '',
                    '# SECTION 1: CROSS-UTILITY MUNICIPAL COMPARISON',
                    'Time,Power_Grid_MW,Water_Flow_kL',
                    ...resourceComparison.map(r => `${r.time},${r.energy},${r.water}`),
                    '',
                    '# SECTION 2: INCIDENT PROPORTIONS (30-DAY SHARE)',
                    'Category,Event_Count',
                    ...incidentCategories.map(r => `${r.category},${r.count}`)
                  ];
                  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvLines.join("\n"));
                  const link = document.createElement("a");
                  link.setAttribute("href", csvContent);
                  link.setAttribute("download", `metropolis_integrated_charts_report.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  setDownloading(null);
                  addAuditLog?.('Exported Integrated Analytics Chart Report (CSV)');
                  setMenuOpen(false);
                }, 800);
              }}
              disabled={downloading !== null}
              className="w-full text-left text-xs p-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/15 hover:to-teal-500/15 rounded-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Full Integrated Report CSV</span>
            </button>
          </motion.div>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 border border-emerald-400/25 transition-transform duration-150 cursor-pointer"
        >
          {downloading ? (
            <>
              <Check className="w-4 h-4 text-white animate-bounce" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-white" />
              <span>Export Chart Data</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
