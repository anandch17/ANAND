export const API_BASE_URL = 'https://localhost:7231/api';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    adminRegister: `${API_BASE_URL}/auth/admin/register`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
  },
  users: {
    base: `${API_BASE_URL}/users`,
    activate: (id: number) => `${API_BASE_URL}/users/${id}/activate`,
    deactivate: (id: number) => `${API_BASE_URL}/users/${id}/deactivate`,
    profile: `${API_BASE_URL}/users/profile`,
    agents: `${API_BASE_URL}/users/agents`,
    customers: `${API_BASE_URL}/users/customers`,
    claimOfficers: `${API_BASE_URL}/users/claim-officers`,
  },
  policies: {
    base: `${API_BASE_URL}/policies`,
    byId: (id: number) => `${API_BASE_URL}/policies/${id}`,
    active: `${API_BASE_URL}/policies/active`,
    paymentPending: `${API_BASE_URL}/policies/payment-pending`,
    admin: `${API_BASE_URL}/policies/admin`,
    assignAgent: (id: number) => `${API_BASE_URL}/policies/${id}/assign-agent`,
    approve: (policyId: number) => `${API_BASE_URL}/policies/${policyId}/approve`,
    buy: (policyId: number) => `${API_BASE_URL}/policies/${policyId}/buy`,
    renew: (policyId: number) => `${API_BASE_URL}/policies/${policyId}/renew`,
    agentPending: `${API_BASE_URL}/policies/agent/pending`,
    agentSold: `${API_BASE_URL}/policies/agent/sold`,
    myPolicies: `${API_BASE_URL}/policies/my-policies`,
    coverages: (id: number) => `${API_BASE_URL}/policies/${id}/coverages`,
  },
  plans: {
    base: `${API_BASE_URL}/plans`,
    byId: (id: number) => `${API_BASE_URL}/plans/${id}`,
    browse: `${API_BASE_URL}/plans/browse`,
    activate: (id: number) => `${API_BASE_URL}/plans/${id}/activate`,
    deactivate: (id: number) => `${API_BASE_URL}/plans/${id}/deactivate`,
  },
  claims: {
    base: `${API_BASE_URL}/claims`,
    raise: `${API_BASE_URL}/claims`,
    myClaims: `${API_BASE_URL}/claims`,
    unassigned: `${API_BASE_URL}/claims/unassigned`,
    assigned: `${API_BASE_URL}/claims/assigned`,
    officerAssigned: `${API_BASE_URL}/claims/officer/assigned`,
    assignOfficer: (id: number) => `${API_BASE_URL}/claims/${id}/assign-officer`,
    review: (claimId: number) => `${API_BASE_URL}/claims/${claimId}/review`,
    settle: (claimId: number) => `${API_BASE_URL}/claims/${claimId}/settle`,
    officerPerformance: `${API_BASE_URL}/claims/officer/performance`,
  },
  premium: {
    calculate: `${API_BASE_URL}/premium/calculate`,
  },
  destinationRisk: {
    base: `${API_BASE_URL}/destination-risk`,
    byId: (id: number) => `${API_BASE_URL}/destination-risk/${id}`,
  },
  upload: {
    file: `${API_BASE_URL}/upload`,
  },
} as const;
