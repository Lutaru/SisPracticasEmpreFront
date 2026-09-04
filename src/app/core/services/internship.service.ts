import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth-response.model';
import { PaginatedList } from '../models/company.model';
import {
  Internship,
  InternshipFilter,
  InternshipReport,
  InternshipStatus,
  ReportStatus,
  ReportType,
} from '../models/internship.model';

@Injectable({
  providedIn: 'root',
})
export class InternshipService {
  private readonly apiUrl = `${environment.apiUrl}/internships`;
  private readonly reportsApiUrl = `${environment.apiUrl}/internship-reports`;

  constructor(private readonly http: HttpClient) {}

  createInternship(data: Partial<Internship>): Observable<ApiResponse<Internship>> {
    return this.http.post<ApiResponse<Internship>>(this.apiUrl, data);
  }

  getMyInternship(): Observable<ApiResponse<Internship | null>> {
    return this.http.get<ApiResponse<Internship | null>>(`${this.apiUrl}/my-internship`);
  }

  getAssignedToMe(): Observable<ApiResponse<Internship[]>> {
    return this.http.get<ApiResponse<Internship[]>>(`${this.apiUrl}/assigned-to-me`);
  }

  getInternships(filter?: InternshipFilter): Observable<ApiResponse<PaginatedList<Internship>>> {
    let params = new HttpParams();
    if (filter) {
      if (filter.studentId) params = params.set('studentId', filter.studentId);
      if (filter.companyId) params = params.set('companyId', filter.companyId);
      if (filter.tutorId) params = params.set('tutorId', filter.tutorId);
      if (filter.status) params = params.set('status', filter.status);
      if (filter.limit) params = params.set('limit', filter.limit.toString());
      if (filter.offset !== undefined) params = params.set('offset', filter.offset.toString());
    }

    return this.http.get<ApiResponse<PaginatedList<Internship>>>(this.apiUrl, { params });
  }

  getInternshipById(id: string): Observable<ApiResponse<Internship>> {
    return this.http.get<ApiResponse<Internship>>(`${this.apiUrl}/${id}`);
  }

  assignTutor(id: string, tutorId: string): Observable<ApiResponse<Internship>> {
    return this.http.patch<ApiResponse<Internship>>(`${this.apiUrl}/${id}/assign-tutor`, {
      tutorId,
    });
  }

  updateStatus(id: string, status: InternshipStatus): Observable<ApiResponse<Internship>> {
    return this.http.patch<ApiResponse<Internship>>(`${this.apiUrl}/${id}/status`, { status });
  }

  submitReport(
    internshipId: string,
    data: { reportType: ReportType; fileUrl: string; description?: string },
  ): Observable<ApiResponse<InternshipReport>> {
    return this.http.post<ApiResponse<InternshipReport>>(
      `${this.apiUrl}/${internshipId}/reports`,
      data,
    );
  }

  getReports(internshipId: string): Observable<ApiResponse<InternshipReport[]>> {
    return this.http.get<ApiResponse<InternshipReport[]>>(`${this.apiUrl}/${internshipId}/reports`);
  }

  reviewReport(
    reportId: string,
    data: { status: ReportStatus; tutorObservations: string },
  ): Observable<ApiResponse<InternshipReport>> {
    return this.http.patch<ApiResponse<InternshipReport>>(
      `${this.reportsApiUrl}/${reportId}/review`,
      data,
    );
  }
}
