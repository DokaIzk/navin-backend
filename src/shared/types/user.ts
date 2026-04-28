export enum OrganizationType {
  ENTERPRISE = 'ENTERPRISE',
  LOGISTICS = 'LOGISTICS',
}

export interface IOrganization {
  _id: string;
  name: string;
  type: OrganizationType;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  VIEWER = 'VIEWER',
  CUSTOMER = 'CUSTOMER',
}

export interface IUser {
  _id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  organizationId: string;
  walletAddress?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
