import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/auth/landing/landing.component').then((m) => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login-page/login-page.component').then((m) => m.LoginPageComponent) },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent) },
  { path: 'error', loadComponent: () => import('./features/error/error-page.component').then((m) => m.ErrorPageComponent) },
  { path: 'access-denied', redirectTo: '/error', pathMatch: 'full' },
  {
    path: 'customer',
    canActivate: [authGuard, roleGuard(['Customer'])],
    component: LayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'browse-plans' },
      { path: 'browse-plans', loadComponent: () => import('./features/customer/browse-plans/browse-plans.component').then((m) => m.BrowsePlansComponent) },
      // { path: 'payment-pending', loadComponent: () => import('./features/customer/payment-pending/payment-pending.component').then((m) => m.PaymentPendingComponent) },
      { path: 'active-policies', loadComponent: () => import('./features/customer/active-policies/active-policies.component').then((m) => m.ActivePoliciesComponent) },
      { path: 'claims', loadComponent: () => import('./features/customer/claims/claims.component').then((m) => m.ClaimsComponent) },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['Admin'])],
    component: LayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'users' },
      { path: 'users', loadComponent: () => import('./features/admin/users/users.component').then((m) => m.UsersComponent) },
      { path: 'plans', loadComponent: () => import('./features/admin/plans/plans.component').then((m) => m.PlansComponent) },
      { path: 'unassigned-policies', loadComponent: () => import('./features/admin/unassigned-policies/unassigned-policies.component').then((m) => m.UnassignedPoliciesComponent) },
      { path: 'analytics', loadComponent: () => import('./features/admin/analytics/analytics.component').then((m) => m.AnalyticsComponent) },
      { path: 'unassigned-claims', loadComponent: () => import('./features/admin/unassigned-claims/unassigned-claims.component').then((m) => m.UnassignedClaimsComponent) },
      { path: 'risk-management', loadComponent: () => import('./features/admin/risk-management/risk-management.component').then((m) => m.RiskManagementComponent) },
    ],
  },
  {
    path: 'agent',
    canActivate: [authGuard, roleGuard(['Agent'])],
    component: LayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'assigned-policies' },
      { path: 'assigned-policies', loadComponent: () => import('./features/agent/assigned-policies/assigned-policies.component').then((m) => m.AssignedPoliciesComponent) },
      { path: 'sold-policies', loadComponent: () => import('./features/agent/sold-policies/sold-policies.component').then((m) => m.SoldPoliciesComponent) },
      { path: 'performance', loadComponent: () => import('./features/agent/performance/performance.component').then((m) => m.PerformanceComponent) },
    ],
  },
  {
    path: 'claim-officer',
    canActivate: [authGuard, roleGuard(['ClaimOfficer'])],
    component: LayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'assigned-claims' },
      { path: 'assigned-claims', loadComponent: () => import('./features/claim-officer/assigned-claims/assigned-claims.component').then((m) => m.AssignedClaimsComponent) },
      { path: 'review-claim/:id', loadComponent: () => import('./features/claim-officer/review-claim/review-claim.component').then((m) => m.ReviewClaimComponent) },
      { path: 'performance', loadComponent: () => import('./features/claim-officer/performance/performance.component').then((m) => m.PerformanceComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
