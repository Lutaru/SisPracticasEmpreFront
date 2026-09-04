import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth-response.model';
import { Role, User } from '../models/user.model';

export interface UserFilter {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
}

export interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private readonly http: HttpClient) {}

  getUsers(filter?: UserFilter): Observable<ApiResponse<PaginatedUsers>> {
    let params = new HttpParams();
    if (filter) {
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.limit) params = params.set('limit', filter.limit.toString());
      if (filter.search) params = params.set('search', filter.search);
      if (filter.role) params = params.set('role', filter.role);
      if (filter.isActive !== undefined) {
        params = params.set('isActive', filter.isActive.toString());
      }
    }
    return this.http.get<ApiResponse<PaginatedUsers>>(this.apiUrl, { params });
  }

  getUserById(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`);
  }

  createUser(data: Partial<User> & { password: string }): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, data);
  }

  updateUser(id: string, data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/${id}`, data);
  }

  toggleStatus(id: string): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
