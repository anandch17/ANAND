import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClaimService } from '../../../core/services/claim.service';
import { ToastService } from '../../../core/services/toast.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ClaimStatus } from '../../../core/models/claim.model';
import type { AssignedClaimsDto } from '../../../core/models/admin.model';
import { DecimalPipe, SlicePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-review-claim',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, DecimalPipe, SlicePipe, UpperCasePipe],
  templateUrl: './review-claim.component.html',
})
export class ReviewClaimComponent {
  readonly ClaimStatus = ClaimStatus;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly claimService = inject(ClaimService);
  private readonly toast = inject(ToastService);

  claimId = signal<number | null>(null);
  claim = signal<AssignedClaimsDto | null>(null);
  loading = signal(true);
  submitting = signal(false);

  reviewForm = this.fb.nonNullable.group({
    reviewNotes: [''],
  });

  settleForm = this.fb.nonNullable.group({
    settledAmount: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.claimId.set(Number(id));
      this.loadClaim(Number(id));
    } else {
      this.loading.set(false);
    }
  }

  private loadClaim(id: number): void {
    this.claimService.getOfficerAssignedClaims().subscribe({
      next: (list) => {
        const c = list.find((x) => x.id === id) ?? null;
        this.claim.set(c);
        if (c?.baseSettlementAmount) {
          this.settleForm.patchValue({ settledAmount: c.baseSettlementAmount });
        }
        if (c?.settledAmount) {
          this.settleForm.patchValue({ settledAmount: c.settledAmount });
        }
        if (c?.reviewNotes) {
          this.reviewForm.patchValue({ reviewNotes: c.reviewNotes });
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  review(status: 'Approved' | 'Rejected'): void {
    const id = this.claimId();
    if (id == null) return;
    this.submitting.set(true);
    const reviewNotes = this.reviewForm.getRawValue().reviewNotes;

    this.claimService.reviewClaim(id, { status, reviewNotes }).subscribe({
      next: () => {
        this.toast.success(`Claim ${status.toLowerCase()}.`);
        this.loadClaim(id);
        this.submitting.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to review claim');
        this.submitting.set(false);
      },
    });
  }

  settle(): void {
    const id = this.claimId();
    if (id == null || this.settleForm.invalid) return;
    this.submitting.set(true);
    const amount = this.settleForm.getRawValue().settledAmount;
    this.claimService.settleClaim(id, { settledAmount: amount }).subscribe({
      next: () => {
        this.toast.success('Claim settled.');
        this.router.navigate(['/claim-officer/assigned-claims']);
        this.submitting.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed');
        this.submitting.set(false);
      },
    });
  }
}
