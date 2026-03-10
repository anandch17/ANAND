/**
 * Policy DTOs - match backend TravelInsurance.Application.Dtos.PolicyDto exactly.
 */

export interface CreatePolicyRequestDto {
  planId: number;
  destinationCountry: string;
  startDate: string; // ISO date
  endDate: string;
  travelers?: any[];
}

export interface PolicyResponseDto {
  id: number;
  planId: number;
  planName: string;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  status: string;
  destinationCountry: string;
  ageMultiplier: number;
  travelers?: any[];
}

export interface PolicyList {
  id: number;
  planId: number;
  planName: string;
  customerName: string;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  status: string;
  destinationCountry: string;
  ageMultiplier: number;
}

export interface PaymentPendingPolicyDto {
  policyId: number;
  planId: number;
  planName: string;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  destinationCountry: string;
  ageMultiplier: number;
}

export interface BuyPolicyResponseDto {
  policyId: number;
  paidAmount: number;
  paymentStatus: string;
  policyStatus: string;
}

export interface BrowsePlanDto {
  planId: number;
  planName: string;
  planType: string;
  maxCoverageAmount: number;
  coverageAmount: number;
  calculatedPremium?: number; // Added to store dynamic premium locally
  dynamicCoverages?: CoverageDto[]; // Added for dynamic scaling
}

export interface CoverageDto {
  coverageType: string;
  coverageAmount: number;
}

export interface CalculatePremiumResponseDto {
  finalPremium: number;
  ageMultiplier: number;
  dynamicCoverages: CoverageDto[];
}

/** Policy lifecycle status values from backend */
export const PolicyStatus = {
  Interested: 'Interested',
  PendingAgentApproval: 'PendingAgentApproval',
  PaymentPending: 'PaymentPending',
  Active: 'Active',
  Pending: 'Pending',
  Assigned: 'Assigned',
} as const;
export type PolicyStatusType = (typeof PolicyStatus)[keyof typeof PolicyStatus];
