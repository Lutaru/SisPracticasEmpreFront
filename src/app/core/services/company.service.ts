import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth-response.model';
import {
  Company,
  CompanyFilter,
  PaginatedList,
  Agreement,
  AgreementStatus,
} from '../models/company.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private readonly apiUrl = `${environment.apiUrl}/companies`;
  private readonly agreementUrl = `${environment.apiUrl}/agreements`;

  constructor(private readonly http: HttpClient) {}

  getCompanies(filter?: CompanyFilter): Observable<ApiResponse<PaginatedList<Company>>> {
    let params = new HttpParams();
    if (filter) {
      if (filter.search) params = params.set('search', filter.search);
      if (filter.sector) params = params.set('sector', filter.sector);
      if (filter.city) params = params.set('city', filter.city);
      if (typeof filter.isVerified === 'boolean') {
        params = params.set('isVerified', filter.isVerified.toString());
      }
      if (filter.limit) params = params.set('limit', filter.limit.toString());
      if (filter.offset !== undefined) params = params.set('offset', filter.offset.toString());
    }

    return this.http.get<ApiResponse<PaginatedList<Company>>>(this.apiUrl, { params });
  }

  getCompanyById(id: string): Observable<ApiResponse<Company>> {
    return this.http.get<ApiResponse<Company>>(`${this.apiUrl}/${id}`);
  }

  getMyCompany(): Observable<ApiResponse<Company | null>> {
    return this.http.get<ApiResponse<Company | null>>(`${this.apiUrl}/me`);
  }

  createCompany(companyData: Partial<Company>): Observable<ApiResponse<Company>> {
    return this.http.post<ApiResponse<Company>>(this.apiUrl, companyData);
  }

  updateCompany(id: string, companyData: Partial<Company>): Observable<ApiResponse<Company>> {
    return this.http.patch<ApiResponse<Company>>(`${this.apiUrl}/${id}`, companyData);
  }

  verifyCompany(id: string, isVerified: boolean): Observable<ApiResponse<Company>> {
    return this.http.patch<ApiResponse<Company>>(`${this.apiUrl}/${id}/verify`, { isVerified });
  }

  createAgreement(companyId: string, agreementData: Partial<Agreement>): Observable<ApiResponse<Agreement>> {
    return this.http.post<ApiResponse<Agreement>>(
      `${this.apiUrl}/${companyId}/agreements`,
      agreementData,
    );
  }

  getAgreementsByCompany(companyId: string): Observable<ApiResponse<Agreement[]>> {
    return this.http.get<ApiResponse<Agreement[]>>(`${this.apiUrl}/${companyId}/agreements`);
  }

  updateAgreementStatus(
    agreementId: string,
    status: AgreementStatus,
    observations?: string,
  ): Observable<ApiResponse<Agreement>> {
    return this.http.patch<ApiResponse<Agreement>>(`${this.agreementUrl}/${agreementId}/status`, {
      status,
      observations,
    });
  }
}
