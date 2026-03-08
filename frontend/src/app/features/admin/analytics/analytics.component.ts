import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyService } from '../../../core/services/policy.service';
import { PlanService } from '../../../core/services/plan.service';
import { ClaimService } from '../../../core/services/claim.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import type { PolicyAssignmentDto } from '../../../core/models/admin.model';
import type { PlanResponseDto } from '../../../core/models/admin.model';
import type { ClaimListDto } from '../../../core/models/admin.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, CardComponent, BaseChartDirective],
  templateUrl: './analytics.component.html',
})
export class AnalyticsComponent {
  private readonly policyService = inject(PolicyService);
  private readonly planService = inject(PlanService);
  private readonly claimService = inject(ClaimService);

  plans = signal<PlanResponseDto[]>([]);
  policies = signal<PolicyAssignmentDto[]>([]);
  claims = signal<ClaimListDto[]>([]);

  // Chart: Policies by Status
  policyChartData = computed<ChartData<'pie'>>(() => {
    const counts: Record<string, number> = {};
    this.policies().forEach(p => {
      counts[p.status] = (counts[p.status] ?? 0) + 1;
    });
    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'],
        hoverOffset: 4
      }]
    };
  });

  policyChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Policies by Status' }
    }
  };

  // Chart: Claims by Status
  claimChartData = computed<ChartData<'doughnut'>>(() => {
    const counts: Record<string, number> = {};
    this.claims().forEach(c => {
      counts[c.status] = (counts[c.status] ?? 0) + 1;
    });
    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#3b82f6', '#facc15', '#22c55e', '#dc2626', '#a855f7'],
        hoverOffset: 4
      }]
    };
  });

  claimChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Claims by Status' }
    }
  };

  // Chart: Top Sold Plans
  planChartData = computed<ChartData<'bar'>>(() => {
    const counts: Record<string, number> = {};
    this.policies().forEach(p => {
      counts[p.planName] = (counts[p.planName] ?? 0) + 1;
    });
    const sortedPlans = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      labels: sortedPlans.map(([name]) => name),
      datasets: [{
        label: 'Policies Sold',
        data: sortedPlans.map(([, count]) => count),
        backgroundColor: '#0ea5e9',
        borderRadius: 8
      }]
    };
  });

  planChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top 5 Sold Plans' }
    },
    scales: {
      x: { beginAtZero: true, grid: { display: false } },
      y: { grid: { display: false } }
    }
  };

  constructor() {
    this.planService.getAllPlans().subscribe(list => this.plans.set(list));
    this.policyService.getAdminPolicies().subscribe(list => this.policies.set(list));
    this.claimService.getAllClaims().subscribe(list => this.claims.set(list));
  }
}
