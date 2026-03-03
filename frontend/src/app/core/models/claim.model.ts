/**
 * Claim DTOs - match backend TravelInsurance.Application.Dtos.ClaimDto exactly.
 */

export interface RaiseClaimDto {
  policyId: number;
  claimType: string;
  claimAmount: number;
  documentUrls: string[];
}

export interface ClaimWithDocumentsDto {
  claimId: number;
  claimType: string;
  claimAmount: number;
  status: string;
  documentUrls: string[];
}

export interface ClaimResponseDto {
  claimId: number;
  claimType: string;
  claimAmount: number;
  status: string;
}

export interface ReviewClaimDto {
  status: 'Approved' | 'Rejected';
}

export interface SettleClaimDto {
  settledAmount: number;
}

/** Claim status values from backend */
export const ClaimStatus = {
  Submitted: 'Submitted',
  UnderReview: 'Under Review',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Settled: 'Settled',
  Pending: 'Pending',
} as const;
export type ClaimStatusType = (typeof ClaimStatus)[keyof typeof ClaimStatus];

export interface ClaimOfficerPerformance {
  totalAssigned: number;
  approvedClaims: number;
  rejectedClaims: number;
  pendingClaims: number;
  totalSettledAmount: number;
}
