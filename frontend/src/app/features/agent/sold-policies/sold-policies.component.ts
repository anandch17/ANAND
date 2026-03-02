import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, SlicePipe, UpperCasePipe } from '@angular/common';
import { PolicyService } from '../../../core/services/policy.service';
import { ToastService } from '../../../core/services/toast.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import type { PolicyAssignmentDto } from '../../../core/models/admin.model';

@Component({
  selector: 'app-sold-policies',
  standalone: true,
  imports: [CardComponent, DatePipe, DecimalPipe, SlicePipe, UpperCasePipe],
  templateUrl: './sold-policies.component.html',
})
export class SoldPoliciesComponent {
  private readonly policyService = inject(PolicyService);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  policies = signal<PolicyAssignmentDto[]>([]);

  constructor() {
    this.policyService.getAgentSoldPolicies().subscribe({
      next: (list) => {
        this.policies.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to load');
        this.loading.set(false);
      },
    });
    console.log( this.policyService.getAgentSoldPolicies().subscribe({
      next: (list) => {
        this.policies.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to load');
        this.loading.set(false);
      },
    }));
  }
}
