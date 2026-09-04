import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth-response.model';
import { PaginatedList } from '../models/company.model';
import {
  InternshipOffer,
  OfferFilter,
  OfferStatus,
} from '../models/offer.model';

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  private readonly apiUrl = `${environment.apiUrl}/offers`;

  constructor(private readonly http: HttpClient) {}

  getOffers(filter?: OfferFilter): Observable<ApiResponse<PaginatedList<InternshipOffer>>> {
    let params = new HttpParams();
    if (filter) {
      if (filter.search) params = params.set('search', filter.search);
      if (filter.profileNeeded) params = params.set('profileNeeded', filter.profileNeeded);
      if (filter.modality) params = params.set('modality', filter.modality);
      if (filter.status) params = params.set('status', filter.status);
      if (filter.location) params = params.set('location', filter.location);
      if (filter.companyId) params = params.set('companyId', filter.companyId);
      if (filter.limit) params = params.set('limit', filter.limit.toString());
      if (filter.offset !== undefined) params = params.set('offset', filter.offset.toString());
    }

    return this.http.get<ApiResponse<PaginatedList<InternshipOffer>>>(this.apiUrl, { params });
  }

  getOfferById(id: string): Observable<ApiResponse<InternshipOffer>> {
    return this.http.get<ApiResponse<InternshipOffer>>(`${this.apiUrl}/${id}`);
  }

  createOffer(offerData: Partial<InternshipOffer>): Observable<ApiResponse<InternshipOffer>> {
    return this.http.post<ApiResponse<InternshipOffer>>(this.apiUrl, offerData);
  }

  updateOffer(id: string, offerData: Partial<InternshipOffer>): Observable<ApiResponse<InternshipOffer>> {
    return this.http.patch<ApiResponse<InternshipOffer>>(`${this.apiUrl}/${id}`, offerData);
  }

  updateOfferStatus(id: string, status: OfferStatus): Observable<ApiResponse<InternshipOffer>> {
    return this.http.patch<ApiResponse<InternshipOffer>>(`${this.apiUrl}/${id}/status`, { status });
  }
}
