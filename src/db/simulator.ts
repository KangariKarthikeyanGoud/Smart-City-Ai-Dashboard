/**
 * Smart City DB Simulator
 * Procedurally generates and manages 1000+ records for traffic, pollution, water, crime, and alerts.
 * Provides data accessors, analytics, and prediction capabilities.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface TrafficRecord {
  id: string;
  sector: string;
  timestamp: string; // ISO String
  congestionLevel: number; // 0 - 100
  avgSpeed: number; // km/h
  vehicleCount: number;
  roadClosure: boolean;
  rushHour: boolean;
  travelTimeMultiplier: number;
}

export interface PollutionRecord {
  id: string;
  sector: string;
  timestamp: string;
  aqi: number; // 0 - 300+
  pm25: number; // ug/m3
  pm10: number; // ug/m3
  no2: number; // ppb
  co: number; // ppm
  so2: number; // ppb
  o3: number; // ppb
  temperature: number; // °C
  humidity: number; // %
}

export interface WaterRecord {
  id: string;
  sector: string;
  timestamp: string;
  consumption: number; // Liters
  leakDetected: boolean;
  tankLevel: number; // 0 - 100%
  pipelineHealth: number; // 0 - 100%
  pressure: number; // psi
}

export interface CrimeRecord {
  id: string;
  sector: string;
  timestamp: string;
  category: 'Theft' | 'Accident' | 'Robbery' | 'Violence' | 'Fraud';
  severity: 'Low' | 'Medium' | 'High';
  location: string;
  resolved: boolean;
}

export interface EmergencyAlert {
  id: string;
  sector: string;
  timestamp: string;
  type: 'Fire' | 'Flood' | 'Accident' | 'Medical' | 'Power Failure' | 'Earthquake' | 'Storm';
  description: string;
  severity: 'Low' | 'Medium' | 'Critical' | 'SOS';
  resolved: boolean;
}

export interface SensorInfo {
  id: string;
  type: 'Traffic' | 'Air Quality' | 'Water Flow' | 'Security';
  sector: string;
  status: 'Online' | 'Offline' | 'Maintenance';
  lastReading: string;
}

export interface SmartCityDatabase {
  traffic: TrafficRecord[];
  pollution: PollutionRecord[];
  water: WaterRecord[];
  crime: CrimeRecord[];
  alerts: EmergencyAlert[];
  sensors: SensorInfo[];
}

const DB_FILE = path.join(process.cwd(), 'db_store.json');
const SECTORS = ['Sector A (Downtown)', 'Sector B (Industrial)', 'Sector C (Residential East)', 'Sector D (Suburbs West)', 'Sector E (Waterfront)'];

// Procedural generator to create 1000 realistic records for each category
export function generateSmartCityData(): SmartCityDatabase {
  console.log('Generating realistic Smart City datasets...');
  
  const traffic: TrafficRecord[] = [];
  const pollution: PollutionRecord[] = [];
  const water: WaterRecord[] = [];
  const crime: CrimeRecord[] = [];
  const alerts: EmergencyAlert[] = [];
  const sensors: SensorInfo[] = [];

  // Generate Sensors first (about 25 sensors across sectors)
  let sensorId = 1;
  SECTORS.forEach(sector => {
    ['Traffic', 'Air Quality', 'Water Flow', 'Security'].forEach(type => {
      sensors.push({
        id: `SEN-${sensorId++}`,
        type: type as any,
        sector,
        status: Math.random() > 0.08 ? 'Online' : (Math.random() > 0.5 ? 'Maintenance' : 'Offline'),
        lastReading: new Date().toISOString()
      });
    });
  });

  const now = new Date();
  
  // Generate 1000 Traffic Records (last 30 days)
  for (let i = 0; i < 1000; i++) {
    const recordDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const hour = recordDate.getHours();
    const isWeekend = recordDate.getDay() === 0 || recordDate.getDay() === 6;
    const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
    
    // Rush Hour: 8:00-10:00 or 17:00-19:00 on weekdays
    const isRushHour = !isWeekend && ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19));
    
    // Base congestion on sector and rush hour
    let baseCongestion = 25 + Math.random() * 20; // default 25-45
    if (sector.includes('Downtown')) baseCongestion += 20;
    if (sector.includes('Waterfront') && (hour >= 18 || isWeekend)) baseCongestion += 15;
    if (isRushHour) baseCongestion += 35;
    
    const congestionLevel = Math.min(100, Math.max(5, Math.round(baseCongestion)));
    const vehicleCount = Math.round(congestionLevel * (15 + Math.random() * 10));
    
    // Average speed is inversely proportional to congestion
    const avgSpeed = Math.round(Math.max(10, 80 - (congestionLevel * 0.7) + (Math.random() * 10 - 5)));
    const roadClosure = Math.random() < 0.02; // 2% chance
    const travelTimeMultiplier = parseFloat((1.0 + (congestionLevel / 40)).toFixed(2));

    traffic.push({
      id: `TRF-${100000 + i}`,
      sector,
      timestamp: recordDate.toISOString(),
      congestionLevel,
      avgSpeed,
      vehicleCount,
      roadClosure,
      rushHour: isRushHour,
      travelTimeMultiplier
    });
  }

  // Generate 1000 Pollution Records (last 30 days)
  for (let i = 0; i < 1000; i++) {
    const recordDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const hour = recordDate.getHours();
    const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
    
    // Industry sector has high pollution
    let baseAqi = 40 + Math.random() * 40;
    if (sector.includes('Industrial')) baseAqi += 90;
    if (sector.includes('Downtown')) baseAqi += 35; // traffic exhaust
    
    // Diurnal variations (higher in the afternoon and morning rush)
    if (hour >= 8 && hour <= 10) baseAqi += 15;
    if (hour >= 14 && hour <= 17) baseAqi += 10;
    
    const aqi = Math.round(Math.max(10, baseAqi));
    
    // PM2.5 and PM10 track AQI
    const pm25 = parseFloat((aqi * 0.35 + Math.random() * 5).toFixed(1));
    const pm10 = parseFloat((aqi * 0.65 + Math.random() * 10).toFixed(1));
    const no2 = Math.round(aqi * 0.4 + Math.random() * 8);
    const co = parseFloat((aqi * 0.015 + Math.random() * 0.2).toFixed(2));
    const so2 = Math.round(sector.includes('Industrial') ? (aqi * 0.3 + Math.random() * 15) : (aqi * 0.05 + Math.random() * 3));
    const o3 = Math.round(aqi * 0.25 + Math.random() * 12);
    
    // Temperature oscillates between 15°C and 35°C based on hour
    const tempOffset = Math.sin((hour - 6) / 24 * 2 * Math.PI) * 8;
    const temperature = parseFloat((23 + tempOffset + (Math.random() * 4 - 2)).toFixed(1));
    const humidity = Math.round(Math.max(10, Math.min(100, 65 - tempOffset * 2 + (Math.random() * 10 - 5))));

    pollution.push({
      id: `POL-${100000 + i}`,
      sector,
      timestamp: recordDate.toISOString(),
      aqi,
      pm25,
      pm10,
      no2,
      co,
      so2,
      o3,
      temperature,
      humidity
    });
  }

  // Generate 1000 Water Records (last 30 days)
  for (let i = 0; i < 1000; i++) {
    const recordDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const hour = recordDate.getHours();
    const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
    
    // Standard residential consumption peaks in morning (7am - 9am) and evening (6pm - 8pm)
    const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 20);
    
    let baseConsumption = 12000 + Math.random() * 6000;
    if (sector.includes('Industrial')) baseConsumption *= 2.5;
    if (sector.includes('Residential')) baseConsumption *= 1.4;
    if (isPeakHour) baseConsumption *= 1.8;
    
    const consumption = Math.round(baseConsumption);
    const leakDetected = Math.random() < 0.015; // 1.5% leak probability
    
    // Tank levels and pipeline health fluctuate
    const pipelineHealth = Math.round(Math.max(30, 95 - (Math.random() * 20) - (leakDetected ? 30 : 0)));
    const tankLevel = Math.round(Math.max(10, Math.min(100, 85 - (consumption / 4000) + (Math.random() * 15 - 5))));
    const pressure = Math.round(Math.max(15, Math.min(100, 55 + (leakDetected ? -25 : 0) + (Math.random() * 12 - 6))));

    water.push({
      id: `WTR-${100000 + i}`,
      sector,
      timestamp: recordDate.toISOString(),
      consumption,
      leakDetected,
      tankLevel,
      pipelineHealth,
      pressure
    });
  }

  // Generate 1000 Crime Records (last 30 days)
  const crimeCategories: Array<'Theft' | 'Accident' | 'Robbery' | 'Violence' | 'Fraud'> = ['Theft', 'Accident', 'Robbery', 'Violence', 'Fraud'];
  const locationsBySector: Record<string, string[]> = {
    'Sector A (Downtown)': ['Grand Avenue', 'Financial District', 'Central Subway', 'Metro Station', 'Plaza Center'],
    'Sector B (Industrial)': ['Warehouse Row', 'Power Station Rd', 'Docks Loop', 'Metalworks Lane', 'Freight Depot'],
    'Sector C (Residential East)': ['Maple Street', 'Oak Ridge', 'Greenwood Park', 'Highschool Rd', 'Library Blvd'],
    'Sector D (Suburbs West)': ['Sunset Crescent', 'Meadow Lane', 'Valley View', 'Pine Drive', 'Canyon Road'],
    'Sector E (Waterfront)': ['The Boardwalk', 'Marina Drive', 'Yacht Club Pier', 'Beachfront Promenade', 'Harbor View']
  };

  for (let i = 0; i < 1000; i++) {
    const recordDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
    const category = crimeCategories[Math.floor(Math.random() * crimeCategories.length)];
    
    // Severity distributions
    let severity: 'Low' | 'Medium' | 'High' = 'Low';
    const rand = Math.random();
    if (category === 'Violence' || category === 'Robbery') {
      severity = rand > 0.4 ? 'High' : 'Medium';
    } else if (category === 'Theft' || category === 'Accident') {
      severity = rand > 0.7 ? 'High' : (rand > 0.3 ? 'Medium' : 'Low');
    } else {
      severity = rand > 0.9 ? 'High' : (rand > 0.5 ? 'Medium' : 'Low');
    }

    const locations = locationsBySector[sector] || ['Main Street'];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const resolved = Math.random() > 0.25; // 75% resolved

    crime.push({
      id: `CRM-${100000 + i}`,
      sector,
      timestamp: recordDate.toISOString(),
      category,
      severity,
      location,
      resolved
    });
  }

  // Generate 100 Emergency Alerts (last 10 days)
  const alertTypes: Array<'Fire' | 'Flood' | 'Accident' | 'Medical' | 'Power Failure' | 'Earthquake' | 'Storm'> = [
    'Fire', 'Flood', 'Accident', 'Medical', 'Power Failure', 'Earthquake', 'Storm'
  ];
  const alertDescriptions: Record<string, string[]> = {
    'Fire': ['Structural fire reported in warehouse', 'Apartment building electrical fire', 'Trash compacting unit explosion', 'Kitchen fire at restaurant'],
    'Flood': ['Water main rupture flooding subway', 'Boardwalk inundation due to high tide', 'Drainage backup on Highway 3', 'River bank overflowing'],
    'Accident': ['Multi-vehicle collision on highway', 'Pedestrian struck near downtown station', 'Construction scaffold collapse', 'Industrial chemical spill'],
    'Medical': ['Heat stroke emergency during marathon', 'Severe respiratory distress outbreak', 'Multiple trauma event', 'Cardiac emergency in shopping mall'],
    'Power Failure': ['Grid overload in Sector B', 'Substation failure after lightning strike', 'Blackout affecting Downtown commercial area', 'Local power pole down'],
    'Earthquake': ['Minor tremor 3.4 magnitude detected', 'Structural vibration inspection triggered'],
    'Storm': ['Gale force wind debris on road', 'Flooded underpass due to heavy downpour', 'Severe lightning warning', 'Tree branch down blocking major intersection']
  };

  for (let i = 0; i < 100; i++) {
    const recordDate = new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000);
    const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    
    const descriptions = alertDescriptions[type] || ['General emergency alert'];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    let severity: 'Low' | 'Medium' | 'Critical' | 'SOS' = 'Medium';
    if (type === 'Earthquake' || type === 'Fire') severity = Math.random() > 0.5 ? 'SOS' : 'Critical';
    else if (type === 'Flood' || type === 'Accident') severity = Math.random() > 0.3 ? 'Critical' : 'Medium';
    else severity = Math.random() > 0.6 ? 'Medium' : 'Low';

    const resolved = Math.random() > 0.6; // 40% active (since it's recent 10 days)

    alerts.push({
      id: `ALT-${100000 + i}`,
      sector,
      timestamp: recordDate.toISOString(),
      type,
      description,
      severity,
      resolved
    });
  }

  // Sort all arrays by timestamp descending
  traffic.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  pollution.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  water.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  crime.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return { traffic, pollution, water, crime, alerts, sensors };
}

// Global active database
let activeDb: SmartCityDatabase | null = null;

export function getDatabase(): SmartCityDatabase {
  if (activeDb) return activeDb;

  try {
    if (fs.existsSync(DB_FILE)) {
      console.log('Loading database from persistent file...');
      const dataStr = fs.readFileSync(DB_FILE, 'utf-8');
      activeDb = JSON.parse(dataStr);
      return activeDb!;
    }
  } catch (err) {
    console.error('Error loading persistent db file, regenerating...', err);
  }

  activeDb = generateSmartCityData();
  saveDatabase();
  return activeDb;
}

export function saveDatabase() {
  if (!activeDb) return;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(activeDb, null, 2), 'utf-8');
    console.log('Database saved to disk.');
  } catch (err) {
    console.error('Failed to write database to disk:', err);
  }
}

// Helper query function for Gemini API to ask smart city questions
export function queryCityDatabaseSummary(): string {
  const db = getDatabase();
  const activeAlertsCount = db.alerts.filter(a => !a.resolved).length;
  
  // Calculate average Traffic Congestion per sector
  const trafficBySector = SECTORS.map(sector => {
    const sectorTraffic = db.traffic.filter(t => t.sector === sector);
    const avgCongestion = Math.round(sectorTraffic.reduce((sum, t) => sum + t.congestionLevel, 0) / (sectorTraffic.length || 1));
    return `${sector}: ${avgCongestion}%`;
  }).join(', ');

  // Calculate average AQI per sector
  const pollutionBySector = SECTORS.map(sector => {
    const sectorPollution = db.pollution.filter(p => p.sector === sector);
    const avgAqi = Math.round(sectorPollution.reduce((sum, p) => sum + p.aqi, 0) / (sectorPollution.length || 1));
    return `${sector}: AQI ${avgAqi}`;
  }).join(', ');

  // Calculate active leaks
  const activeLeaks = db.water.filter(w => w.leakDetected).length;

  // Crime breakdowns
  const crimeCount = db.crime.length;
  const crimeBreakdown = db.crime.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return `
    Metropolis Prime Smart City Summary Data:
    - Sectors: ${SECTORS.join(', ')}
    - Active alerts: ${activeAlertsCount} active emergency alerts.
    - Average Traffic Congestion by sector: ${trafficBySector}
    - Average AQI (Air Quality Index) by sector: ${pollutionBySector} (Note: Sector B is the Industrial Sector with highest pollution, Sector D has lowest)
    - Water Utility Health: ${activeLeaks} anomalies/leaks reported in last 30 days.
    - Total incidents reported (last 30 days): ${crimeCount}. Categories: ${JSON.stringify(crimeBreakdown)}
  `;
}
