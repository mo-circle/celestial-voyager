
export interface OrbitalElements {
  a: number;      // Semi-major axis (AU)
  e: number;      // Eccentricity
  i: number;      // Inclination (degrees)
  L: number;      // Mean longitude (degrees)
  longPeri: number; // Longitude of perihelion (degrees)
  longNode: number; // Longitude of ascending node (degrees)
  // Rates per century (optional for high precision over long spans)
  a_rate: number;
  e_rate: number;
  i_rate: number;
  L_rate: number;
  longPeri_rate: number;
  longNode_rate: number;
}

export interface PlanetData {
  id: string;
  name: string;
  color: string;
  atmosphereColor?: string; // Optional hex for atmospheric glow
  radius: number; 
  elements: OrbitalElements;
  orbitalPeriod: number; // Days (for reference)
  rotationSpeed: number; 
  description: string;
  mass: string;
  gravity: string;
  temp: string;
  distanceFromSun: string;
  hasRings?: boolean;
  textureUrl: string;
  ringTextureUrl?: string;
}

export enum SimulationTab {
  Explorer = 'Explorer',
  Physics = 'Physics',
  Data = 'Data'
}

export enum ViewMode {
  System = 'System',
  Focus = 'Focus'
}
