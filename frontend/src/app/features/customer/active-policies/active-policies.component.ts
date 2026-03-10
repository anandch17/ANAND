import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { PolicyService } from '../../../core/services/policy.service';
import { ToastService } from '../../../core/services/toast.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import type { PolicyResponseDto } from '../../../core/models/policy.model';

@Component({
  selector: 'app-active-policies',
  standalone: true,
  imports: [CardComponent, RouterLink, DatePipe, DecimalPipe, FormsModule],
  templateUrl: './active-policies.component.html',
})
export class ActivePoliciesComponent {
  private readonly policyService = inject(PolicyService);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  renewing = signal<number | null>(null);
  policies = signal<PolicyResponseDto[]>([]);
  filteredPolicies = signal<PolicyResponseDto[]>([]);
  currentFilter = signal<string>('All');

  availableFilters = ['All', 'Active', 'Interested', 'PendingAgentApproval', 'PaymentPending', 'Expired'];

  renewDays = signal<{ [key: number]: number }>({});

  constructor(private router: Router) {
    this.load();
  }

  load(): void {
    this.policyService.getMyPolicies().subscribe({
      next: (list) => {
        this.policies.set(list);
        this.applyFilter(this.currentFilter());
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? err.message ?? 'Failed to load');
        this.loading.set(false);
      },
    });
  }

  getFilterClass(filter: string, isActive: boolean): string {
    if (!isActive) return 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800';

    switch (filter) {
      case 'Active': return 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/30 border-transparent';
      case 'Interested': return 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-500/30 border-transparent';
      case 'PendingAgentApproval': return 'bg-amber-500 text-white shadow-md ring-2 ring-amber-500/30 border-transparent';
      case 'PaymentPending': return 'bg-orange-500 text-white shadow-md ring-2 ring-orange-500/30 border-transparent';
      case 'Expired': return 'bg-rose-600 text-white shadow-md ring-2 ring-rose-500/30 border-transparent';
      default: return 'bg-sky-600 text-white shadow-md ring-2 ring-sky-500/30 border-transparent'; // All
    }
  }

  applyFilter(filter: string): void {
    this.currentFilter.set(filter);
    if (filter === 'All') {
      this.filteredPolicies.set(this.policies());
    } else {
      this.filteredPolicies.set(this.policies().filter(p => p.status === filter));
    }
  }

  renewPolicy(policy: PolicyResponseDto): void {
    const days = this.renewDays()[policy.id] || 30;
    if (days <= 0 || days > 180) {
      this.toast.error('Extension must be between 1 and 180 days');
      return;
    }

    this.renewing.set(policy.id);
    this.policyService.renewPolicy(policy.id, days).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.load();
        this.renewing.set(null);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? err.message ?? 'Failed to renew policy');
        this.renewing.set(null);
      }
    });
  }

  downloadInvoice(p: PolicyResponseDto): void {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text('TravelSecure', margin, y);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Your Trusted Travel Protection Partner', margin, y + 7);

    y += 25;

    // Title
    doc.setFontSize(18);
    doc.setTextColor(30);
    doc.text('Policy Invoice', margin, y);
    doc.line(margin, y + 2, 190, y + 2);

    y += 15;

    // Policy Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Policy Information', margin, y);
    doc.setFont('helvetica', 'normal');

    y += 10;
    const details = [
      ['Policy Number:', `#${p.id}`],
      ['Insurance Plan:', p.planName],
      ['Destination:', p.destinationCountry || 'Global'],
      ['Start Date:', new Date(p.startDate).toLocaleDateString()],
      ['End Date:', new Date(p.endDate).toLocaleDateString()],
      ['Total Premium:', `$${p.premiumAmount.toFixed(2)}`]
    ];

    details.forEach(detail => {
      doc.text(detail[0], margin, y);
      doc.text(detail[1], margin + 50, y);
      y += 8;
    });

    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Thank you for choosing TravelSecure. Have a safe journey!', margin, y);

    // Footer
    doc.setFontSize(8);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, 280);

    doc.save(`Invoice_Policy_${p.id}.pdf`);
    this.toast.success('Invoice downloaded successfully');
  }

  buyPolicy(policy: PolicyResponseDto): void {
    const paymentData = {
      planId: policy.planId,
      customerId: 0, // Ignored by backend as it uses token, or can be fetched from token. The Payment payload just needs a number.

      startDate: policy.startDate,
      endDate: policy.endDate,
      basePremium: policy.premiumAmount,
      totalPremium: policy.premiumAmount,
      travelers: policy.travelers
    };

    // Store in session storage to simulate the flow from browse-plans
    sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
    sessionStorage.setItem('pendingPolicyId', policy.id.toString());

    this.router.navigate(['/customer/payment-pending']);
  }

  formatAadhar(val: string | undefined): string {
    if (!val) return 'Not Provided';
    const digits = val.replace(/\D/g, '');
    return digits.match(/.{1,4}/g)?.join(' ') || digits;
  }

  updateRenewDays(policyId: number, days: number): void {
    const safeDays = days ? Math.floor(Math.abs(days)) : 0;
    this.renewDays.update(current => ({ ...current, [policyId]: safeDays }));
  }
}
