export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  speed?: number | null;
  heading?: number | null;
}

export enum UserRole {
  DRIVER = 'driver',
  EMPLOYEE = 'employee',
  COLLABORATOR = 'collaborator',
  NONE = 'none'
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface AdditionalBusStatus {
  incidentReported: boolean | null;
  seatsAvailable: boolean | null;
  lastStatusUpdate: number | null;
}