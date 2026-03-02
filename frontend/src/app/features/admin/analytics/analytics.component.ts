import { Component, inject, signal } from '@angular/core';
import { PolicyService } from '../../../core/services/policy.service';
import { PlanService } from '../../../core/services/plan.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import type { PolicyAssignmentDto } from '../../../core/models/admin.model';
import type { PlanResponseDto } from '../../../core/models/admin.model';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './analytics.component.html',
})
export class AnalyticsComponent {
  private readonly policyService = inject(PolicyService);
  private readonly planService = inject(PlanService);

  plans = signal<PlanResponseDto[]>([]);
  assignedPolicies = signal<PolicyAssignmentDto[]>([]);
  planCounts = signal<{ planName: string; count: number }[]>([]);

 constructor() {
  this.planService.getAllPlans().subscribe((list) => {
    this.plans.set(list);
  });

  this.policyService
    .getAdminPolicies('PendingAgentApproval')
    .subscribe((list) => {
      this.assignedPolicies.set(list);

      const counts: Record<string, number> = {};

      for (const p of list) {
        counts[p.planName] = (counts[p.planName] ?? 0) + 1;
      }

      this.planCounts.set(
        Object.entries(counts).map(([planName, count]) => ({
          planName,
          count,
        }))
      );
    });
}
}
