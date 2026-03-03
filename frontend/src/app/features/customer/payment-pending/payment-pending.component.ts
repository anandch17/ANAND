import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, SlicePipe } from '@angular/common';
import { PolicyService } from '../../../core/services/policy.service';
import { ToastService } from '../../../core/services/toast.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import type { PaymentPendingPolicyDto } from '../../../core/models/policy.model';

@Component({
  selector: 'app-payment-pending',
  standalone: true,
  imports: [CardComponent, DatePipe, DecimalPipe, SlicePipe],
  templateUrl: './payment-pending.component.html',
})
export class PaymentPendingComponent {
  private readonly policyService = inject(PolicyService);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  payingId = signal<number | null>(null);
  policies = signal<PaymentPendingPolicyDto[]>([]);

  constructor() {
    this.load();
  }

  load(): void {
    this.policyService.getPaymentPendingPolicies().subscribe({
      next: (list) => {
        this.policies.set(list);
        
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? err.message ?? 'Failed to load');
        this.loading.set(false);
      },
    });
  }
 

  pay(policyId: number): void {
    this.payingId.set(policyId);
    this.policyService.buyPolicy(policyId).subscribe({
      next: () => {
        this.toast.success('Payment successful. Policy is now active.');
        this.load();
        this.payingId.set(null);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? err.message ?? 'Payment failed');
        this.payingId.set(null);
      },
    });
  }
}
