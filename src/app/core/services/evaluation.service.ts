import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth-response.model';
import {
  CreateEvaluationPayload,
  Evaluation,
  EvaluationSummary,
  EvaluationType,
} from '../models/evaluation.model';

@Injectable({
  providedIn: 'root',
})
export class EvaluationService {
  private readonly apiUrl = `${environment.apiUrl}/evaluations`;

  constructor(private readonly http: HttpClient) {}

  createEvaluation(
    payload: CreateEvaluationPayload,
  ): Observable<ApiResponse<Evaluation>> {
    return this.http.post<ApiResponse<Evaluation>>(this.apiUrl, payload);
  }

  getInternshipSummary(
    internshipId: string,
  ): Observable<ApiResponse<EvaluationSummary>> {
    return this.http.get<ApiResponse<EvaluationSummary>>(
      `${this.apiUrl}/internship/${internshipId}/summary`,
    );
  }

  getEvaluationsByInternship(
    internshipId: string,
  ): Observable<ApiResponse<Evaluation[]>> {
    return this.http.get<ApiResponse<Evaluation[]>>(
      `${this.apiUrl}/internship/${internshipId}`,
    );
  }

  getEvaluations(filters?: {
    internshipId?: string;
    evaluatorType?: EvaluationType;
    page?: number;
    limit?: number;
  }): Observable<
    ApiResponse<{
      items: Evaluation[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    let params = new HttpParams();
    if (filters) {
      if (filters.internshipId) {
        params = params.set('internshipId', filters.internshipId);
      }
      if (filters.evaluatorType) {
        params = params.set('evaluatorType', filters.evaluatorType);
      }
      if (filters.page) {
        params = params.set('page', filters.page.toString());
      }
      if (filters.limit) {
        params = params.set('limit', filters.limit.toString());
      }
    }
    return this.http.get<
      ApiResponse<{
        items: Evaluation[];
        total: number;
        page: number;
        limit: number;
      }>
    >(this.apiUrl, { params });
  }

  getEvaluationById(id: string): Observable<ApiResponse<Evaluation>> {
    return this.http.get<ApiResponse<Evaluation>>(`${this.apiUrl}/${id}`);
  }
}
