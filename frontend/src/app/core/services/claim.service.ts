import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import type {
  RaiseClaimDto,
  ClaimWithDocumentsDto,
  ClaimResponseDto,
  ReviewClaimDto,
  SettleClaimDto,
  ClaimOfficerPerformance,
} from '../models/claim.model';
import type { ClaimListDto, AssignedClaimsDto } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class ClaimService {
  constructor(private readonly http: HttpClient) { }

  raiseClaim(dto: RaiseClaimDto): Observable<ClaimResponseDto> {
    return this.http.post<ClaimResponseDto>(API_ENDPOINTS.claims.raise, dto);
  }

  getMyClaims(): Observable<ClaimWithDocumentsDto[]> {
    return this.http.get<ClaimWithDocumentsDto[]>(API_ENDPOINTS.claims.myClaims);
  }

  getUnassignedClaims(): Observable<ClaimListDto[]> {
    return this.http.get<ClaimListDto[]>(API_ENDPOINTS.claims.unassigned);
  }

  getAssignedClaims(): Observable<AssignedClaimsDto[]> {
    return this.http.get<AssignedClaimsDto[]>(API_ENDPOINTS.claims.assigned);
  }

  getOfficerAssignedClaims(): Observable<AssignedClaimsDto[]> {
    return this.http.get<AssignedClaimsDto[]>(API_ENDPOINTS.claims.officerAssigned);
  }

  assignOfficer(claimId: number, officerId: number): Observable<void> {
    return this.http.patch<void>(API_ENDPOINTS.claims.assignOfficer(claimId), null, {
      params: { agentid: officerId },
    });
  }

  reviewClaim(claimId: number, dto: ReviewClaimDto): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(API_ENDPOINTS.claims.review(claimId), dto);
  }

  settleClaim(claimId: number, dto: SettleClaimDto): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(API_ENDPOINTS.claims.settle(claimId), dto);
  }

  getOfficerPerformance(): Observable<ClaimOfficerPerformance> {
    return this.http.get<ClaimOfficerPerformance>(API_ENDPOINTS.claims.officerPerformance);
  }

  getAllClaims(): Observable<ClaimListDto[]> {
    return this.http.get<ClaimListDto[]>(API_ENDPOINTS.claims.base + '/all');
  }
}
