import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import type { PlanResponseDto, CreatePlanDto } from '../models/admin.model';
import type { BrowsePlanDto, CalculatePremiumResponseDto } from '../models/policy.model';

@Injectable({ providedIn: 'root' })
export class PlanService {
  constructor(private readonly http: HttpClient) { }

  getAllPlans(): Observable<PlanResponseDto[]> {
    return this.http.get<PlanResponseDto[]>(API_ENDPOINTS.plans.base);
  }

  browsePlans(coverageType: string): Observable<BrowsePlanDto[]> {
    return this.http.get<BrowsePlanDto[]>(API_ENDPOINTS.plans.browse, {
      params: { coverageType },
    });
  }

  createPlan(dto: CreatePlanDto): Observable<unknown> {
    return this.http.post(API_ENDPOINTS.plans.base, dto);
  }

  activatePlan(id: number): Observable<void> {
    return this.http.patch<void>(API_ENDPOINTS.plans.activate(id), {});
  }

  deactivatePlan(id: number): Observable<void> {
    return this.http.patch<void>(API_ENDPOINTS.plans.deactivate(id), {});
  }

  updatePlan(id: number, dto: CreatePlanDto) {
    return this.http.put(
      `${API_ENDPOINTS.plans.byId(id)}`,
      dto
    );
  }

  calculatePremium(dto: any): Observable<CalculatePremiumResponseDto> {
    return this.http.post<CalculatePremiumResponseDto>(API_ENDPOINTS.premium.calculate, dto);
  }

  getPlanById(id: number): Observable<PlanResponseDto> {
    return this.http.get<PlanResponseDto>(API_ENDPOINTS.plans.byId(id));
  }
}
