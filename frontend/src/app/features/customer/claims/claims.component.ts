import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { DatePipe, DecimalPipe, SlicePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClaimService } from '../../../core/services/claim.service';
import { PolicyService } from '../../../core/services/policy.service';
import { ToastService } from '../../../core/services/toast.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import type { ClaimWithDocumentsDto, ClaimResponseDto, ClaimStatus } from '../../../core/models/claim.model';
import type { PolicyResponseDto } from '../../../core/models/policy.model';

@Component({
  selector: 'app-claims',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, DatePipe, DecimalPipe, RouterLink, SlicePipe, UpperCasePipe],
  templateUrl: './claims.component.html',
})
export class ClaimsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly claimService = inject(ClaimService);
  private readonly policyService = inject(PolicyService);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  submitting = signal(false);
  showRaiseForm = signal(false);
  claims = signal<ClaimWithDocumentsDto[]>([]);
  activePolicies = signal<PolicyResponseDto[]>([]);

  raiseForm = this.fb.nonNullable.group({
    policyId: [0, [Validators.required, Validators.min(1)]],
    claimType: ['', Validators.required],
    claimAmount: [0, [Validators.required, Validators.min(0)]],
    documentUrlsText: [''],
  });

  //claimTypes = ['Medical', 'Baggage Loss', 'Trip Cancellation', 'Flight Delay', 'Other'];
  claimTypes = [
    'Medical Expenses',
    'Trip Cancellation',
    'Baggage Loss',
    'Personal Accident',
    'Emergency Evacuation',
    'Loss of Passport',
    'Flight Delay',
    'Personal Liability'
  ];

  constructor() {
    this.loadClaims();
  }

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap.get('raise');
    if (q) {
      const policyId = parseInt(q, 10);
      if (policyId) {
        this.showRaiseForm.set(true);
        this.raiseForm.patchValue({ policyId });
        this.loadActivePolicies();
      }
    }
  }

  loadActivePolicies(): void {
    this.policyService.getActivePolicies().subscribe({
      next: (list) => this.activePolicies.set(list),
      error: () => this.activePolicies.set([]),
    });
  }

  loadClaims(): void {
    this.claimService.getMyClaims().subscribe({
      next: (list) => {
        this.claims.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? err.message ?? 'Failed to load claims');
        this.loading.set(false);
      },
    });
  }

  openRaiseForm(): void {
    this.showRaiseForm.set(true);
    this.policyService.getActivePolicies().subscribe({
      next: (list) => this.activePolicies.set(list),
      error: () => this.activePolicies.set([]),
    });
  }

  submitClaim(): void {
    if (this.raiseForm.invalid) return;
    const raw = this.raiseForm.getRawValue();
    const urls = raw.documentUrlsText ? raw.documentUrlsText.split('\n').map((s) => s.trim()).filter(Boolean) : [];
    this.submitting.set(true);
    this.claimService
      .raiseClaim({
        policyId: raw.policyId,
        claimType: raw.claimType,
        claimAmount: raw.claimAmount,
        documentUrls: urls,
      })
      .subscribe({
        next: () => {
          this.toast.success('Claim submitted.');
          this.loadClaims();
          this.showRaiseForm.set(false);
          this.raiseForm.reset({ policyId: 0, claimType: '', claimAmount: 0, documentUrlsText: '' });
          this.submitting.set(false);
        },
        error: (err) => {
          this.toast.error(err.error?.message ?? err.message ?? 'Failed to submit claim');
          this.submitting.set(false);
        },
      });
  }
}
