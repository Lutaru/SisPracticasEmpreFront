import { InternshipOffer } from './offer.model';
import { User } from './user.model';

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  PRESELECTED = 'PRESELECTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface Application {
  id: string;
  offerId: string;
  offer?: InternshipOffer;
  studentId: string;
  student?: User;
  status: ApplicationStatus;
  coverLetter?: string | null;
  resumeUrl?: string | null;
  feedback?: string | null;
  interviewDate?: string | null;
  appliedAt: string;
  updatedAt: string;
}

export interface ApplicationFilter {
  offerId?: string;
  studentId?: string;
  status?: ApplicationStatus;
  limit?: number;
  offset?: number;
}
