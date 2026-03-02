import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, SlicePipe, UpperCasePipe } from '@angular/common';
import { PolicyService } from '../../../core/services/policy.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import type { PolicyAssignmentDto } from '../../../core/models/admin.model';
import type { AgentDropdownDto } from '../../../core/models/admin.model';

@Component({
  selector: 'app-unassigned-policies',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, SlicePipe, UpperCasePipe, CardComponent],
  templateUrl: './unassigned-policies.component.html',
})
export class UnassignedPoliciesComponent {
  private readonly policyService = inject(PolicyService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  allPolicies = signal<PolicyAssignmentDto[]>([]);
  agents = signal<AgentDropdownDto[]>([]);
  selectedAgents = signal<Record<number, number>>({});

  filterStatus = signal<string>('');

  filteredPolicies = computed(() => {
    const status = this.filterStatus();
    const list = this.allPolicies();
    if (!status) return list;
    return list.filter(p => p.status === status);
  });

  readonly statusOptions = [
    { label: 'Interested', value: 'Interested' },
    { label: 'Agent Approval Pending', value: 'PendingAgentApproval' },
    { label: 'Payment Pending', value: 'PaymentPending' },
    { label: 'Active', value: 'Active' },
    { label: 'Expired', value: 'Expired' }
  ];

  constructor() {
    this.fetchData();
    this.userService.getAgents().subscribe((list) => this.agents.set(list));
  }

 private fetchData(): void {
  this.loading.set(true);

  this.policyService.getAdminPolicies(this.filterStatus()).subscribe({
    next: (list) => {
      this.allPolicies.set(list);
      this.loading.set(false);
    },
    error: (err) => {
      this.toast.error(err.error?.message ?? 'Failed to load policies');
      this.loading.set(false);
    },
  });
}

  onStatusFilterChange(event: Event): void {
  const status = (event.target as HTMLSelectElement).value;
  this.filterStatus.set(status);
  this.fetchData();
}

  selectedAgentId(policyId: number): number {
    return this.selectedAgents()[policyId] ?? 0;
  }

  getSelectedAgentId(policyId: number): number {
    return this.selectedAgents()[policyId] ?? 0;
  }

  onSelectAgent(policyId: number, event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedAgents.update((m) => ({ ...m, [policyId]: val ? Number(val) : 0 }));
  }

  assignAgent(policyId: number): void {
    const agentId = this.selectedAgents()[policyId];
    if (!agentId) return;
    this.policyService.assignAgent(policyId, agentId).subscribe({
      next: () => {
        this.toast.success('Agent assigned successfully.');
        this.fetchData();
        this.selectedAgents.update((m) => {
          const next = { ...m };
          delete next[policyId];
          return next;
        });
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Failed to assign'),
    });
  }
}
