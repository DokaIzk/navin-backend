export enum TelemetryAnchorStatus {
  PENDING_ANCHOR = 'PENDING_ANCHOR',
  ANCHORED = 'ANCHORED',
  ANCHOR_FAILED = 'ANCHOR_FAILED',
}

export interface ITelemetry {
  _id: string;
  sensorId?: string;
  shipmentId: string;
  temperature: number;
  humidity: number;
  latitude: number;
  longitude: number;
  batteryLevel: number;
  timestamp: Date;
  dataHash: string;
  stellarTxHash?: string;
  anchorStatus: TelemetryAnchorStatus;
  anchorError?: string;
  rawPayload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}