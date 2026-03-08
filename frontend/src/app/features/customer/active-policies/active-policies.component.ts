import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { jsPDF } from 'jspdf';
import { PolicyService } from '../../../core/services/policy.service';
import { ToastService } from '../../../core/services/toast.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import type { PolicyResponseDto } from '../../../core/models/policy.model';

@Component({
  selector: 'app-active-policies',
  standalone: true,
  imports: [CardComponent, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './active-policies.component.html',
})
export class ActivePoliciesComponent {
  private readonly policyService = inject(PolicyService);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  policies = signal<PolicyResponseDto[]>([]);

  constructor() {
    this.load();
  }

  load(): void {
    this.policyService.getActivePolicies().subscribe({
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
}
