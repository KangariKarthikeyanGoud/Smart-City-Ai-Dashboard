/**
 * Smart City Express Backend Server
 * Controls data queries, alerts, sensor configurations, and AI completions.
 * Seamlessly integrates Vite in development and serves static bundles in production.
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  getDatabase, 
  saveDatabase, 
  queryCityDatabaseSummary,
  TrafficRecord,
  PollutionRecord,
  WaterRecord,
  CrimeRecord,
  EmergencyAlert,
  SensorInfo
} from './src/db/simulator';

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Bootstrap initial dataset
  const db = getDatabase();
  console.log(`Database loaded with:
    - ${db.traffic.length} traffic entries
    - ${db.pollution.length} pollution entries
    - ${db.water.length} water entries
    - ${db.crime.length} crime entries
    - ${db.alerts.length} emergency alerts
    - ${db.sensors.length} active sensors`);

  // --- API ROUTES ---

  // 1. Unified Dashboard Overview
  app.get('/api/city-overview', (req, res) => {
    const database = getDatabase();
    
    // Summary states
    const activeAlerts = database.alerts.filter(a => !a.resolved);
    const onlineSensorsCount = database.sensors.filter(s => s.status === 'Online').length;
    
    // Average metrics for quick indicators
    const avgCongestion = Math.round(database.traffic.slice(0, 100).reduce((sum, t) => sum + t.congestionLevel, 0) / 100);
    const avgAqi = Math.round(database.pollution.slice(0, 100).reduce((sum, p) => sum + p.aqi, 0) / 100);
    const avgPipelineHealth = Math.round(database.water.slice(0, 100).reduce((sum, w) => sum + w.pipelineHealth, 0) / 100);
    const totalWaterConsumed = database.water.slice(0, 24).reduce((sum, w) => sum + w.consumption, 0);
    const unresolvedCrimes = database.crime.filter(c => !c.resolved).length;

    res.json({
      activeAlertsCount: activeAlerts.length,
      onlineSensorsCount,
      totalSensorsCount: database.sensors.length,
      avgCongestion,
      avgAqi,
      avgPipelineHealth,
      totalWaterConsumed,
      unresolvedCrimes,
      recentAlerts: database.alerts.slice(0, 5),
      sensors: database.sensors
    });
  });

  // 2. Traffic Congestion & Prediction API
  app.get('/api/traffic', (req, res) => {
    const database = getDatabase();
    
    // Group traffic by hour for hourly charts (last 24 entries)
    const hourlyCongestion = database.traffic.slice(0, 24).map(t => ({
      time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      congestion: t.congestionLevel,
      speed: t.avgSpeed,
      count: t.vehicleCount
    })).reverse();

    // Alternate routes definitions
    const alternateRoutes = [
      { id: 'R1', from: 'Sector A', to: 'Sector C', standardRoute: 'Highway 1 (Main)', alternate: 'Greenwood Bypass', standardTime: '28 mins', alternateTime: '19 mins', recommended: true, savings: '9 mins' },
      { id: 'R2', from: 'Sector B', to: 'Sector A', standardRoute: 'Bridge Terminal Road', alternate: 'Port Boulevard Extension', standardTime: '35 mins', alternateTime: '42 mins', recommended: false, savings: '-7 mins' },
      { id: 'R3', from: 'Sector E', to: 'Sector D', standardRoute: 'Coastal Boulevard', alternate: 'Valley Parkway Route', standardTime: '22 mins', alternateTime: '15 mins', recommended: true, savings: '7 mins' }
    ];

    res.json({
      recentRecords: database.traffic.slice(0, 50),
      hourlyCongestion,
      alternateRoutes,
      closures: database.traffic.filter(t => t.roadClosure).slice(0, 5)
    });
  });

  // 3. Pollution & Environmental Monitoring API
  app.get('/api/pollution', (req, res) => {
    const database = getDatabase();

    // Group current AQI by Sector
    const sectors = Array.from(new Set(database.pollution.map(p => p.sector)));
    const sectorAqi = sectors.map(sec => {
      const records = database.pollution.filter(p => p.sector === sec);
      const latest = records[0];
      const avgAqi = Math.round(records.reduce((sum, r) => sum + r.aqi, 0) / records.length);
      return {
        sector: sec,
        aqi: latest?.aqi || 50,
        pm25: latest?.pm25 || 12,
        pm10: latest?.pm10 || 20,
        temp: latest?.temperature || 24,
        humidity: latest?.humidity || 60,
        avgAqi,
        status: latest?.aqi > 150 ? 'Hazardous' : (latest?.aqi > 100 ? 'Unhealthy' : (latest?.aqi > 50 ? 'Moderate' : 'Good'))
      };
    });

    res.json({
      sectorAqi,
      historicalLog: database.pollution.slice(0, 50),
      safetyBoundaries: {
        safe: ['Sector D (Suburbs West)', 'Sector C (Residential East)'],
        warning: ['Sector A (Downtown)', 'Sector E (Waterfront)'],
        danger: ['Sector B (Industrial)']
      }
    });
  });

  // 4. Water Flow Analytics API
  app.get('/api/water', (req, res) => {
    const database = getDatabase();
    
    // Recent leak anomalies
    const leaks = database.water.filter(w => w.leakDetected).slice(0, 10);
    
    // Pipeline health indicators
    const pipelines = SECTORS_MAP.map((sector, idx) => {
      const sectorWater = database.water.filter(w => w.sector === sector);
      const latest = sectorWater[0];
      return {
        id: `PL-${100 + idx}`,
        sector,
        health: latest?.pipelineHealth || 90,
        pressure: latest?.pressure || 50,
        status: (latest?.pipelineHealth || 90) < 60 ? 'Critical' : ((latest?.pipelineHealth || 90) < 85 ? 'Maintenance Required' : 'Optimal'),
        flowRate: latest ? Math.round(latest.consumption / 360) : 45 // liters/sec approximate
      };
    });

    res.json({
      historicalLog: database.water.slice(0, 50),
      leaks,
      pipelines
    });
  });

  // 5. Crime Intelligence API
  app.get('/api/crime', (req, res) => {
    const database = getDatabase();
    
    // Group crime categories
    const categories = ['Theft', 'Accident', 'Robbery', 'Violence', 'Fraud'];
    const distribution = categories.map(cat => ({
      category: cat,
      count: database.crime.filter(c => c.category === cat).length
    }));

    // Historical trend by sector
    const sectorTrends = SECTORS_MAP.map(sec => {
      const records = database.crime.filter(c => c.sector === sec);
      const highSeverity = records.filter(c => c.severity === 'High').length;
      return {
        sector: sec,
        total: records.length,
        highSeverity,
        resolvedRate: Math.round((records.filter(c => c.resolved).length / (records.length || 1)) * 100)
      };
    });

    res.json({
      distribution,
      sectorTrends,
      recentIncidents: database.crime.slice(0, 30)
    });
  });

  // 6. Emergency Alerts Management API
  app.get('/api/alerts', (req, res) => {
    const database = getDatabase();
    res.json(database.alerts);
  });

  // POST: Trigger SOS or Broadcast Emergency
  app.post('/api/alerts', (req, res) => {
    const database = getDatabase();
    const { type, sector, description, severity } = req.body;
    
    if (!type || !sector || !description) {
      return res.status(400).json({ error: 'Missing required parameters: type, sector, description' });
    }

    const newAlert: EmergencyAlert = {
      id: `ALT-${100000 + database.alerts.length + 1}`,
      sector,
      timestamp: new Date().toISOString(),
      type,
      description,
      severity: severity || 'Medium',
      resolved: false
    };

    database.alerts.unshift(newAlert);
    saveDatabase();

    // Simulate SMS / Email integration logs
    console.log(`[ALERT BROADCAST TRIGGERED]
      Type: ${type}
      Sector: ${sector}
      Severity: ${severity}
      SMS Alerts Dispatched: 142,510 numbers notified
      Email Alerts Broadcast: Sent to all active sector residents`);

    res.status(201).json({
      message: 'Emergency Broadcast issued successfully.',
      alert: newAlert,
      simulatedDispatch: {
        smsCount: 142510,
        emailCount: 65400,
        pushCount: 198000,
        authoritiesNotified: true
      }
    });
  });

  // POST: Resolve Alert
  app.post('/api/alerts/:id/resolve', (req, res) => {
    const database = getDatabase();
    const alertId = req.params.id;
    const alert = database.alerts.find(a => a.id === alertId);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    alert.resolved = true;
    saveDatabase();

    res.json({ message: `Alert ${alertId} marked as RESOLVED`, alert });
  });

  // 7. Sensor Calibration / Administration
  app.post('/api/sensors/:id/status', (req, res) => {
    const database = getDatabase();
    const sensorId = req.params.id;
    const { status } = req.body;

    if (!status || !['Online', 'Offline', 'Maintenance'].includes(status)) {
      return res.status(400).json({ error: 'Invalid sensor status' });
    }

    const sensor = database.sensors.find(s => s.id === sensorId);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    sensor.status = status;
    sensor.lastReading = new Date().toISOString();
    saveDatabase();

    res.json({ message: `Sensor ${sensorId} updated to ${status}`, sensor });
  });

  // 8. Google Gemini AI Smart City Chatbot Endpoint
  app.post('/api/chat', async (req, res) => {
    const { message, chatHistory } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const client = getGeminiClient();
    const systemSummary = queryCityDatabaseSummary();
    const systemPrompt = `You are "Metropolis AI", the official central operations AI Assistant for Metropolis Prime Smart City.
    You have direct access to live telemetry summaries from across the city's 5 major sectors:
    1. Sector A (Downtown) - Commercial hub, high congestion, moderate AQI.
    2. Sector B (Industrial) - Factories, warehouses, very high pollution (heavy AQI, PM2.5, SO2 issues), lower water pipeline health.
    3. Sector C (Residential East) - Dense population, low crime, average traffic, optimal utilities.
    4. Sector D (Suburbs West) - Suburban estates, low pollution (best AQI), high safety index, occasional localized theft.
    5. Sector E (Waterfront) - Leisure, high tourism, high dining traffic at night, water flow sensors.

    Live City Telemetry Overview to base your responses on:
    ${systemSummary}

    Format your answers beautifully. Be professional, highly analytical, and direct. Use bullet points or styled text to display metrics if asked. 
    If a user asks about predictions, refer to city trends:
    - Traffic: Downtown congestion peaks daily between 8:00 AM - 10:00 AM and 5:00 PM - 7:00 PM. Alternate routes like the Greenwood Bypass save up to 10 minutes.
    - Air Quality: Industrial Sector has severe spikes around 2:00 PM during daily shifts.
    - Water consumption: Peaks in morning and evening, pipeline leakage anomalies present in Sector B.
    - Security: Unresolved crime incidents are mostly Low-Medium severity. Safe zones are Sectors C and D.

    Answer the user's questions clearly, accurately, and naturally based on this live telemetry context. Avoid generic statements and provide precise stats from the telemetry.`;

    if (client) {
      try {
        console.log(`Sending user prompt to Google Gemini model (gemini-3.5-flash)...`);
        
        // Prepare chat messages format
        const contents = [];
        if (chatHistory && Array.isArray(chatHistory)) {
          chatHistory.forEach((item: any) => {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.content }]
            });
          });
        }
        contents.push({ role: 'user', parts: [{ text: message }] });

        const response = await client.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7
          }
        });

        res.json({ response: response.text });
      } catch (err: any) {
        console.error('Gemini API call failed:', err);
        res.status(500).json({ 
          error: 'AI generation failed', 
          details: err.message,
          fallback: generateSimulatedResponse(message, systemSummary) 
        });
      }
    } else {
      console.log('No GEMINI_API_KEY detected. Using server-side local fallback rule engine.');
      // Direct high-quality deterministic simulator answers if API key is not configured
      const responseText = generateSimulatedResponse(message, systemSummary);
      res.json({ response: responseText, warning: 'Running in offline simulation mode. Configure GEMINI_API_KEY in Secrets panel for the real live LLM.' });
    }
  });

  // --- VITE MIDDLEWARE CONFIGURATION ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Express running in DEVELOPMENT mode with Vite Middleware.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Express running in PRODUCTION mode serving compiled client assets.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart City Platform live on port ${PORT}`);
  });
}

const SECTORS_MAP = [
  'Sector A (Downtown)',
  'Sector B (Industrial)',
  'Sector C (Residential East)',
  'Sector D (Suburbs West)',
  'Sector E (Waterfront)'
];

// High-fidelity fallback rule engine if Gemini key is missing
function generateSimulatedResponse(message: string, summary: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes('pollution') || msg.includes('aqi') || msg.includes('air')) {
    return `### 💨 Air Quality & Pollution Report (Metropolis AI)

Live telemetry indicates **Sector B (Industrial)** is experiencing the highest levels of particulate matter and gaseous effluents.

**Key Metrics:**
*   **Highest Sector:** Sector B (Industrial) with average AQI values frequently exceeding **140 - 185** (Unhealthy for Sensitive Groups).
*   **Primary Pollutants:** PM2.5 (avg 55 µg/m³), PM10 (avg 110 µg/m³), and SO₂ (approx 32 ppb).
*   **Safest Air:** **Sector D (Suburbs West)** holds an average AQI of **35** (Excellent/Optimal).
*   **Recommendation:** Citizens in Sector B are advised to limit strenuous outdoor activities during active factory shifts (between 1:00 PM and 5:00 PM).`;
  }

  if (msg.includes('traffic') || msg.includes('road') || msg.includes('congestion') || msg.includes('route')) {
    return `### 🚗 Traffic Congestion Report (Metropolis AI)

Our predictive system has updated vehicle flow parameters across all major intersections.

**Current Live Status:**
*   **Sector A (Downtown):** Experiencing substantial delays with congestion currently estimated at **74%**. Average vehicle speeds have dropped to 18 km/h.
*   **Alternative Routing Recommendation:** For travel from Sector E (Waterfront) to Sector C (Residential East), please bypass downtown by taking the **Greenwood Bypass**. This route is currently operating with free-flowing traffic and saves approximately **9 - 11 minutes** of travel time.
*   **Road Closures:** A minor localized road closure is reported on **Grand Avenue** in Sector A due to utility maintenance. Traffic diversion signs have been active since 08:30.`;
  }

  if (msg.includes('unsafe') || msg.includes('crime') || msg.includes('safe') || msg.includes('police')) {
    return `### 🛡️ Smart City Security & Safety Insight

Analyzing crime logs and security dispatcher telemetry for Metropolis Prime over the past 30 days:

**Safe Zones:**
*   **Sector D (Suburbs West):** Boasts the highest safety rating (94/100) with crime incidents averaging low-impact theft.
*   **Sector C (Residential East):** Highly secure residential zone with extensive neighborhood watch integration and 89% case resolution rate.

**High Risk Areas:**
*   **Sector A (Downtown) & Sector E (Waterfront):** Higher densities of tourists and nightlife lead to minor incidents of theft, pickpocketing, and traffic accidents after hours.
*   **Sector B (Industrial):** Low pedestrian presence at night results in reduced ambient monitoring; localized security patrols are scheduled.`;
  }

  if (msg.includes('water') || msg.includes('leak') || msg.includes('shortage')) {
    return `### 💧 Water Utility & Pipeline Analysis

Our acoustics telemetry and pressure leak detection sensors report the following status:

**Pipeline Pipeline Health:**
*   **Industrial Sector (Sector B):** Water flow anomalies have flagged a high probability of a pipeline leak near Pipeline 102. System pressure has fluctuated between 32 psi and 40 psi.
*   **Reservoir & Tanks:** Main city tanks are holding stable at **84% capacity**. There is no immediate risk of a freshwater shortage this month.
*   **Conservation Tips:** If you live in Sector B, help our smart grids adjust by reducing high-pressure water use during peak hours (07:00 AM - 09:00 AM).`;
  }

  return `### 🏙️ Metropolis Central AI Assistant

Greetings! I am Metropolis Central AI, ready to assist you. 

Based on current city telemetry:
*   **Active Alerts:** Standard monitoring is active. No major fires or storm events are currently unresolved.
*   **General Traffic:** Standard peak hour queues are building up in downtown commercial grids.
*   **Environmental State:** Air quality indexes are optimal except for the industrial perimeter.

*How can I help you analyze our city's sensors, water networks, traffic prediction flows, or security logs today?*`;
}

startServer();
