import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth-response.model';
import { PaginatedList } from '../models/company.model';
import {
  Application,
  ApplicationFilter,
  ApplicationStatus,
} from '../models/application.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private readonly apiUrl = `${environment.apiUrl}/applications`;

  constructor(private readonly http: HttpClient) {}

  apply(payload: {
    offerId: string;
    resumeUrl?: string;
    coverLetter?: string;
  }): Observable<ApiResponse<Application>> {
    return this.http.post<ApiResponse<Application>>(this.apiUrl, payload);
  }

  getMyApplications(): Observable<ApiResponse<Application[]>> {
    return this.http.get<ApiResponse<Application[]>>(`${this.apiUrl}/my-applications`);
  }

  getApplications(filter?: ApplicationFilter): Observable<ApiResponse<PaginatedList<Application>>> {
    let params = new HttpParams();
    if (filter) {
      if (filter.offerId) params = params.set('offerId', filter.offerId);
      if (filter.studentId) params = params.set('studentId', filter.studentId);
      if (filter.status) params = params.set('status', filter.status);
      if (filter.limit) params = params.set('limit', filter.limit.toString());
      if (filter.offset !== undefined) params = params.set('offset', filter.offset.toString());
    }

    return this.http.get<ApiResponse<PaginatedList<Application>>>(this.apiUrl, { params });
  }

  getApplicationById(id: string): Observable<ApiResponse<Application>> {
    return this.http.get<ApiResponse<Application>>(`${this.apiUrl}/${id}`);
  }

  updateStatus(
    id: string,
    status: ApplicationStatus,
    feedback?: string,
    interviewDate?: string,
  ): Observable<ApiResponse<Application>> {
    return this.http.patch<ApiResponse<Application>>(`${this.apiUrl}/${id}/status`, {
      status,
      feedback,
      interviewDate,
    });
  }
}
