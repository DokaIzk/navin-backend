export interface IApiKey {
  _id: string;
  name: string;
  keyHash: string;
  organizationId: string;
  shipmentId?: string;
  isActive: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}