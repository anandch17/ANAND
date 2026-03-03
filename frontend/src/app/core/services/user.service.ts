import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import type { AgentDropdownDto, UserResponseDto } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private readonly http: HttpClient) { }

  getAgents(): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(API_ENDPOINTS.users.agents);
  }

  getCustomers(): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(API_ENDPOINTS.users.customers);
  }

  getClaimOfficers(): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(API_ENDPOINTS.users.claimOfficers);
  }

  activateUser(id: number): Observable<void> {
    return this.http.patch<void>(API_ENDPOINTS.users.activate(id), {});
  }

  deactivateUser(id: number): Observable<void> {
    return this.http.patch<void>(API_ENDPOINTS.users.deactivate(id), {});
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.users.profile);
  }
}
