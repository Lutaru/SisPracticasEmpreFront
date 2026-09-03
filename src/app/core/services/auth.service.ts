import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, Role } from '../models/user.model';
import { AuthResponse, ApiResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'prax_access_token';
  private readonly REFRESH_KEY = 'prax_refresh_token';
  private readonly USER_KEY = 'prax_user_data';

  // Signals para reactividad moderna
  currentUser = signal<User | null>(this.getInitialUser());
  isAuthenticated = computed(() => !!this.currentUser());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  private getInitialUser(): User | null {
    const rawUser = localStorage.getItem(this.USER_KEY);
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  }

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get refreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  login(credentials: { email: string; password: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      }),
    );
  }

  private setSession(authData: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authData.accessToken);
    localStorage.setItem(this.REFRESH_KEY, authData.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user));
    this.currentUser.set(authData.user);
  }

  logout(): void {
    const token = this.token;
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        next: () => {},
        error: () => {},
      });
    }
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  hasRole(roles: Role[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return roles.includes(user.role);
  }
}
