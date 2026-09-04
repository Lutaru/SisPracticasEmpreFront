import { User } from './user.model';

export enum AgreementStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

export interface Agreement {
  id: string;
  companyId: string;
  agreementNumber: string;
  startDate: string;
  endDate: string;
  status: AgreementStatus;
  documentUrl?: string | null;
  approvedById?: string | null;
  approvedBy?: User | null;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  legalName: string;
  tradeName?: string | null;
  nit: string;
  contactEmail: string;
  phone: string;
  address: string;
  city: string;
  website?: string | null;
  sector: string;
  description?: string | null;
  isVerified: boolean;
  userId?: string | null;
  representativeUser?: User | null;
  agreements?: Agreement[];
  createdAt: string;
  updatedAt: string;
}

export interface CompanyFilter {
  search?: string;
  sector?: string;
  city?: string;
  isVerified?: boolean;
  limit?: number;
  offset?: number;
}

export interface PaginatedList<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
