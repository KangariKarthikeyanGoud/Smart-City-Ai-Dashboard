export type UserRole = 
  | 'Super Admin' 
  | 'City Commissioner' 
  | 'Traffic Department' 
  | 'Police' 
  | 'Water Department' 
  | 'Public User';

export interface Alert {
  id: string;
  sector: string;
  timestamp: string;
  type: 'Fire' | 'Flood' | 'Accident' | 'Medical' | 'Power Failure' | 'Earthquake' | 'Storm';
  description: string;
  severity: 'Low' | 'Medium' | 'Critical' | 'SOS';
  resolved: boolean;
}

export interface Sensor {
  id: string;
  type: 'Traffic' | 'Air Quality' | 'Water Flow' | 'Security';
  sector: string;
  status: 'Online' | 'Offline' | 'Maintenance';
  lastReading: string;
}

export interface OverviewData {
  activeAlertsCount: number;
  onlineSensorsCount: number;
  totalSensorsCount: number;
  avgCongestion: number;
  avgAqi: number;
  avgPipelineHealth: number;
  totalWaterConsumed: number;
  unresolvedCrimes: number;
  recentAlerts: Alert[];
  sensors: Sensor[];
}
