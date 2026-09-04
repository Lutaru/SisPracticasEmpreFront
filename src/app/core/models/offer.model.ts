import { Company } from './company.model';

export enum OfferModality {
  ON_SITE = 'ON_SITE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
}

export enum OfferStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export interface InternshipOffer {
  id: string;
  companyId: string;
  company?: Company;
  title: string;
  description: string;
  requirements: string;
  profileNeeded: string;
  vacancies: number;
  salaryCompensation?: string | null;
  modality: OfferModality;
  location: string;
  status: OfferStatus;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OfferFilter {
  search?: string;
  profileNeeded?: string;
  modality?: OfferModality;
  status?: OfferStatus;
  location?: string;
  companyId?: string;
  limit?: number;
  offset?: number;
}
