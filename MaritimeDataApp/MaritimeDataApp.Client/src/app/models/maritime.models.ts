export interface Ship {
  id: number;
  name: string;
  maxSpeed: number;
}

export interface Port {
  id: number;
  name: string;
  country: string;
}

export interface Voyage {
  id: number;
  voyageDate: string;
  departurePortId: number;
  arrivalPortId: number;
  voyageStart: string;
  voyageEnd: string;
  departurePort?: Port;
  arrivalPort?: Port;
}

// Model for Chart Data (example for ngx-charts)
export interface ChartData {
  name: string;
  value: number;
}
