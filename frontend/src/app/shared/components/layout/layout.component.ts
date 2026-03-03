import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

export enum Role {
  Admin = 'Admin',
  Agent = 'Agent',
  Customer = 'Customer',
  ClaimOfficer = 'ClaimOfficer'
}

export interface NavLink {
  path: string;
  label: string;
  icon: string;
}

const DASHBOARD_LINKS: Record<string, NavLink[]> = {
  Admin: [
    { path: '/admin/analytics', label: 'Analytics Console', icon: 'reports' },
    { path: '/admin/users', label: 'User Directory', icon: 'customers' },
    { path: '/admin/plans', label: 'Plan Catalog', icon: 'policy' },
    { path: '/admin/unassigned-policies', label: 'Unassigned Queue', icon: 'policies' },
    { path: '/admin/unassigned-claims', label: 'Claims Router', icon: 'claims' },
    { path: '/admin/risk-management', label: 'Risk Factors', icon: 'policy' },
  ],
  Customer: [
    { path: '/customer/browse-plans', label: 'Browse Plans', icon: 'policy' },
    { path: '/customer/active-policies', label: 'My Policies', icon: 'policies' },
    { path: '/customer/claims', label: 'Claim Center', icon: 'claims' },
    { path: '/customer/payment-pending', label: 'Pending Payments', icon: 'policy' },
  ],
  Agent: [
    { path: '/agent/performance', label: 'Performance', icon: 'reports' },
    { path: '/agent/assigned-policies', label: 'My Queue', icon: 'policy' },
    { path: '/agent/sold-policies', label: 'Sales History', icon: 'policies' },
  ],
  ClaimOfficer: [
    { path: '/claim-officer/assigned-claims', label: 'Claims Engine', icon: 'claims' },
    { path: '/claim-officer/performance', label: 'Performance Metrics', icon: 'reports' },
  ],
};
// const DASHBOARD_LINKS: Record<string, NavLink[]> = {
//   Admin: [
//     { path: '/admin/analytics', label: 'Analytics Console', icon: 'chart-bar' },
//     { path: '/admin/users', label: 'User Directory', icon: 'users' },
//     { path: '/admin/plans', label: 'Plan Catalog', icon: 'document-text' },
//     { path: '/admin/unassigned-policies', label: 'Unassigned Queue', icon: 'clipboard-document-list' },
//   ],
//   Customer: [
//     { path: '/customer/browse-plans', label: 'Browse Plans', icon: 'policies' },
//     { path: '/customer/active-policies', label: 'My Policies', icon: 'shield-check' },
//     { path: '/customer/claims', label: 'Claim Center', icon: 'document-magnifying-glass' },
//     { path: '/customer/payment-pending', label: 'Pending Payments', icon: 'credit-card' },
//   ],
//   Agent: [
//     { path: '/agent', label: 'Performance', icon: 'presentation-chart-line' },
//     { path: '/agent/assigned-policies', label: 'My Queue', icon: 'inbox-arrow-down' },
//     { path: '/agent/sold-policies', label: 'Sales History', icon: 'currency-dollar' },
//   ],
//   ClaimOfficer: [
//     { path: '/claim-officer', label: 'Claims Engine', icon: 'shield-exclamation' },
//   ],
// };

const PORTAL_LINKS: NavLink[] = [
  { path: '/customer/browse-plans', label: 'Browse Plans', icon: 'globe-alt' },
  { path: '/customer/active-policies', label: 'My Policies', icon: 'shield-check' },
  { path: '/customer/claims', label: 'Claim Center', icon: 'document-magnifying-glass' },
  { path: '/customer/payment-pending', label: 'Pending Payments', icon: 'credit-card' },
];

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SidebarComponent, CommonModule],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  readonly auth = inject(AuthService);
  private router = inject(Router);

  // Make Role enum available to template
  readonly Role = Role;

  get role(): string {
    return this.auth.currentRole() ?? '';
  }

  get navLinks(): NavLink[] {
    return PORTAL_LINKS;
  }

  get sidebarItems(): NavLink[] {
    return DASHBOARD_LINKS[this.role] ?? [];
  }

  get initials(): string {
    const name = this.auth.currentUserName() || 'User';
    return name.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
