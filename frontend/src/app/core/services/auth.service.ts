import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import type { LoginDto, RegisterDto, AgentCoRegisterDto, ForgotPasswordDto, ResetPasswordDto } from '../models/auth.model';

const TOKEN_KEY = 'travel_insurance_jwt';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSignal = signal<string | null>(this.getStoredToken());
  private decodedSignal = signal<{ sub: string; role: string; email?: string; name?: string } | null>(this.decodeToken(this.getStoredToken()));

  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly currentUserId = computed(() => this.decodedSignal()?.sub ?? null);
  readonly currentRole = computed(() => this.decodedSignal()?.role ?? null);
  readonly currentUserName = computed(() => this.decodedSignal()?.name ?? null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) { }

  login(dto: LoginDto): Observable<string> {
    return this.http.post(API_ENDPOINTS.auth.login, dto, { responseType: 'text' }).pipe(
      tap((token) => this.setToken(token))
    );
  }

  register(dto: RegisterDto): Observable<string> {
    return this.http.post(API_ENDPOINTS.auth.register, dto, { responseType: 'text' }).pipe(
      tap((token) => this.setToken(token))
    );
  }

  adminRegister(dto: AgentCoRegisterDto) {
    return this.http.post(API_ENDPOINTS.auth.adminRegister, dto)
     
  }

  forgotPassword(dto: ForgotPasswordDto): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(API_ENDPOINTS.auth.forgotPassword, dto);
  }

  resetPassword(dto: ResetPasswordDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(API_ENDPOINTS.auth.resetPassword, dto);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.decodedSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/']);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.tokenSignal.set(token);
    this.decodedSignal.set(this.decodeToken(token));
  }

  private decodeToken(token: string | null): { sub: string; role: string; email?: string; name?: string } | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? '{}'));
      return {
        sub: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? payload.sub ?? '',
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? payload.role ?? '',
        email: payload.email,
        name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ?? payload.name ?? '',
      };
    } catch {
      return null;
    }
  }
}
