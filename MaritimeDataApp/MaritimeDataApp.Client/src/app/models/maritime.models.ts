export interface Ship {
  id: number;
  name: string;
  maxSpeed: number; // knots
}

export interface Port {
  id: number;
  name: string;
  country: string;
}

export interface Voyage {
  id: number;
  voyageDate: string; // Consider using Date object later
  departurePortId: number;
  arrivalPortId: number;
  voyageStart: string; // ISO 8601 format string recommended (e.g., "2025-05-01T10:00:00Z")
  voyageEnd: string;   // ISO 8601 format string recommended
  // Optional: Include resolved names if backend provides them or fetch separately
  departurePortName?: string;
  arrivalPortName?: string;
}

export interface CountryVisit {
  id: number;
  countryName: string;
}

// Model for Chart Data (example for ngx-charts)
export interface ChartData {
  name: string;
  value: number;
}
