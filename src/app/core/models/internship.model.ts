import { User } from './user.model';
import { Company } from './company.model';
import { Application } from './application.model';

export enum InternshipStatus {
  INITIATED = 'INITIATED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINAL_EVALUATION = 'FINAL_EVALUATION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ReportType {
  INITIAL_PLAN = 'INITIAL_PLAN',
  PARTIAL_1 = 'PARTIAL_1',
  PARTIAL_2 = 'PARTIAL_2',
  FINAL = 'FINAL',
}

export enum ReportStatus {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  OBSERVED = 'OBSERVED',
}

export interface InternshipReport {
  id: string;
  internshipId: string;
  reportType: ReportType;
  fileUrl: string;
  description?: string | null;
  status: ReportStatus;
  tutorObservations?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Internship {
  id: string;
  applicationId?: string | null;
  application?: Application | null;
  studentId: string;
  student?: User | null;
  companyId: string;
  company?: Company | null;
  tutorId?: string | null;
  tutor?: User | null;
  startDate: string;
  endDate: string;
  status: InternshipStatus;
  weeklyHours: number;
  companySupervisorName?: string | null;
  companySupervisorEmail?: string | null;
  reports?: InternshipReport[];
  createdAt: string;
  updatedAt: string;
}

export interface InternshipFilter {
  studentId?: string;
  companyId?: string;
  tutorId?: string;
  status?: InternshipStatus;
  limit?: number;
  offset?: number;
}
