/**
 * Admin/User/Plan DTOs - match backend TravelInsurance.Application.Dtos.AdminDto exactly.
 */

export interface AgentDropdownDto {
  id: number;
  name: string;
}

export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface CreateCoverageDto {
  coverageName: string;
  coverageAmount: number;
}

export interface CreatePremiumRuleDto {
  basePrice: number;
  ageBelow30Multiplier: number;
  ageBetween30And50Multiplier: number;
  ageAbove50Multiplier: number;
  perDayRate: number;
}

export interface CreatePlanDto {
  planName: string;
  planType: string;
  maxCoverageAmount: number;
  isActive: boolean;
  coverages: CreateCoverageDto[];
  premiumRule: CreatePremiumRuleDto;
}

export interface PremiumRuleResponseDto {
  basePrice: number;
  ageBelow30Multiplier: number;
  ageBetween30And50Multiplier: number;
  ageAbove50Multiplier: number;
  perDayRate: number;
}

export interface PlanResponseDto {
  id: number;
  planName: string;
  planType: string;
  maxCoverageAmount: number;
  isActive: boolean;
  coverages: CreateCoverageDto[];
  premiumRule: PremiumRuleResponseDto;
}

export interface PolicyAssignmentDto {
  policyId: number;
  planName: string;
  customerName: string;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  status: string;
  assignedAgentId: number | null;
  assignedAgentName: string | null;
  ageMultiplier: number;
}

export interface ClaimListDto {
  id: number;
  policyNumber: number;
  customerName: string;
  planName: string;
  claimType: string;
  claimAmount: number;
  status: string;
  reviewNotes?: string;
  settledAmount?: number;
}

export interface AssignedClaimsDto {
  id: number;
  policyNumber: number;
  customerName: string;
  planName: string;
  claimType: string;
  claimAmount: number;
  agentName: string;
  status: string;
  documentUrls: string[];
  description?: string;
  reviewNotes?: string;
  baseSettlementAmount?: number;
  settledAmount?: number;
}
