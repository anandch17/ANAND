import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, SlicePipe } from '@angular/common';
import { PolicyService } from '../../../core/services/policy.service';
import { ToastService } from '../../../core/services/toast.service';
import { PolicyResponseDto } from '../../../core/models/policy.model';

import { PaymentGatewayComponent } from '../../../shared/components/payment-gateway/payment-gateway.component';

@Component({
    selector: 'app-payment-pending',
    standalone: true,
    imports: [RouterLink, DatePipe, DecimalPipe, SlicePipe, PaymentGatewayComponent],
    templateUrl: './payment-pending.component.html'
})
export class PaymentPendingComponent {
    private readonly policyService = inject(PolicyService);
    private readonly router = inject(Router);
    private readonly toast = inject(ToastService);

    loading = signal(true);
    policies = signal<PolicyResponseDto[]>([]);
    payingId = signal<number | null>(null);
    payingPolicy = signal<PolicyResponseDto | null>(null);

    constructor() {
        this.load();
    }

    load(): void {
        this.policyService.getMyPolicies().subscribe({
            next: (list) => {
                // Filter out only the PaymentPending ones
                const pending = list.filter(p => p.status === 'PaymentPending');
                this.policies.set(pending);
                this.loading.set(false);
            },
            error: (err) => {
                this.toast.error(err.error?.message ?? err.message ?? 'Failed to load');
                this.loading.set(false);
            }
        });
    }

    pay(policyId: number): void {
        const policy = this.policies().find(p => p.id === policyId);
        if (!policy) return;

        // Open the gateway modal overlay instead of navigating
        this.payingPolicy.set(policy);
    }

    onPaymentSuccess(): void {
        const policy = this.payingPolicy();
        if (!policy) return;

        this.policyService.buyPolicy(policy.id).subscribe({
            next: (res) => {
                this.toast.success('Payment verified! Activating policy...');
                this.payingPolicy.set(null);
                this.router.navigate(['/customer/active-policies']);
            },
            error: (err) => {
                this.toast.error(err.error?.message || 'Payment processing failed on server.');
                this.payingPolicy.set(null);
            }
        });
    }
}
