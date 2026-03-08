import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import type {
  CreatePolicyRequestDto,
  PolicyResponseDto,
  PaymentPendingPolicyDto,
  BuyPolicyResponseDto,
} from '../models/policy.model';
import type { PolicyAssignmentDto } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  constructor(private readonly http: HttpClient) { }

  requestPolicy(dto: CreatePolicyRequestDto): Observable<{ message: string; policyId: number }> {
    return this.http.post<{ message: string; policyId: number }>(API_ENDPOINTS.policies.base, dto);
  }

  getActivePolicies(): Observable<PolicyResponseDto[]> {
    return this.http.get<PolicyResponseDto[]>(API_ENDPOINTS.policies.active);
  }

  getPaymentPendingPolicies(): Observable<PaymentPendingPolicyDto[]> {
    return this.http.get<PaymentPendingPolicyDto[]>(API_ENDPOINTS.policies.paymentPending);
  }

  buyPolicy(policyId: number): Observable<BuyPolicyResponseDto> {
    return this.http.post<BuyPolicyResponseDto>(API_ENDPOINTS.policies.buy(policyId), {});
  }

  getById(id: number): Observable<PolicyResponseDto & { id: number; customerName: string }> {
    return this.http.get<PolicyResponseDto & { id: number; customerName: string }>(API_ENDPOINTS.policies.byId(id));
  }

  getAdminPolicies(status?: string): Observable<PolicyAssignmentDto[]> {
    return this.http.get<PolicyAssignmentDto[]>(
      API_ENDPOINTS.policies.admin,
      {
        params: status ? { status } : {}
      }
    );
  }

  assignAgent(policyId: number, agentId: number): Observable<void> {
    return this.http.patch<void>(API_ENDPOINTS.policies.assignAgent(policyId), null, {
      params: { agentId },
    });
  }

  approvePolicy(policyId: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(API_ENDPOINTS.policies.approve(policyId), {});
  }

  getAgentPendingPolicies(): Observable<PolicyAssignmentDto[]> {
    return this.http.get<PolicyAssignmentDto[]>(API_ENDPOINTS.policies.agentPending);
  }

  getAgentSoldPolicies(): Observable<PolicyAssignmentDto[]> {
    return this.http.get<PolicyAssignmentDto[]>(API_ENDPOINTS.policies.agentSold);
  }

  renewPolicy(policyId: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(API_ENDPOINTS.policies.renew(policyId), {});
  }

  getMyPolicies(): Observable<PolicyResponseDto[]> {
    return this.http.get<PolicyResponseDto[]>(API_ENDPOINTS.policies.myPolicies);
  }

  getPolicyCoverages(policyId: number): Observable<{ coverageType: string; coverageAmount: number }[]> {
    return this.http.get<{ coverageType: string; coverageAmount: number }[]>(API_ENDPOINTS.policies.coverages(policyId));
  }
}
