import { Component, inject, signal, computed } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { PolicyService } from '../../../core/services/policy.service';
import { UserService } from '../../../core/services/user.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import type { PolicyAssignmentDto } from '../../../core/models/admin.model';
import type { UserProfileDto } from '../../../core/models/auth.model';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CardComponent, DecimalPipe, CommonModule],
  templateUrl: './performance.component.html',
})
export class PerformanceComponent {
  private readonly policyService = inject(PolicyService);
  private readonly userService = inject(UserService);

  soldPolicies = signal<PolicyAssignmentDto[]>([]);
  profile = signal<UserProfileDto | null>(null);

  soldCount = computed(() => this.soldPolicies().length);
  totalPremium = computed(() => this.soldPolicies().reduce((sum, p) => sum + p.premiumAmount, 0));

  commissionRate = computed(() => this.profile()?.commissionRate ?? 0);
  commissionReceived = computed(() => (this.totalPremium() * (this.commissionRate() / 100)));

  averagePremium = computed(() => this.soldCount() > 0 ? this.totalPremium() / this.soldCount() : 0);

  // Grouping for distribution
  planDistribution = computed(() => {
    const groups: Record<string, { count: number; total: number }> = {};
    this.soldPolicies().forEach(p => {
      if (!groups[p.planName]) groups[p.planName] = { count: 0, total: 0 };
      groups[p.planName].count++;
      groups[p.planName].total += p.premiumAmount;
    });
    return Object.entries(groups).map(([name, data]) => ({
      name,
      ...data,
      percentage: (data.total / (this.totalPremium() || 1)) * 100
    })).sort((a, b) => b.total - a.total);
  });

  // Sales trend for the last 7 days
  salesTrend = computed(() => {
    const days = 7;
    const trend: { label: string; value: number; height: number }[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayTotal = this.soldPolicies()
        .filter(p => p.startDate.startsWith(dateStr))
        .reduce((sum, p) => sum + p.premiumAmount, 0);

      trend.push({ label: dayLabel, value: dayTotal, height: 0 });
    }

    const maxVal = Math.max(...trend.map(t => t.value), 1000);
    return trend.map(t => ({ ...t, height: (t.value / maxVal) * 100 }));
  });

  constructor() {
    this.policyService.getAgentSoldPolicies().subscribe((list) => this.soldPolicies.set(list));
    this.userService.getProfile().subscribe((p) => this.profile.set(p));
  }
}
