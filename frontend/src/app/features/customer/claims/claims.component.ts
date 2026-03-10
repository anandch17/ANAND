import { Component, inject, signal, computed, effect } from '@angular/core';
import { DatePipe, DecimalPipe, SlicePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClaimService } from '../../../core/services/claim.service';
import { PolicyService } from '../../../core/services/policy.service';
import { UploadService } from '../../../core/services/upload.service';
import { ToastService } from '../../../core/services/toast.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import type { ClaimWithDocumentsDto } from '../../../core/models/claim.model';
import type { PolicyResponseDto } from '../../../core/models/policy.model';
import { forkJoin } from 'rxjs';

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
  private readonly uploadService = inject(UploadService);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  submitting = signal(false);
  showRaiseForm = signal(false);
  claims = signal<ClaimWithDocumentsDto[]>([]);
  activePolicies = signal<PolicyResponseDto[]>([]);

  /** Coverages for the currently selected policy's plan (from backend) */
  policyCoverages = signal<{ coverageType: string; coverageAmount: number }[]>([]);

  /** Reactive signals for form field values */
  selectedPolicyId = signal<number>(0);
  selectedClaimType = signal<string>('');
  enteredAmount = signal<number>(0);

  /**
   * Claim types are derived from the loaded policy coverages.
   * If no policy is selected yet, falls back to common types.
   */
  claimTypes = computed<string[]>(() => {
    const coverages = this.policyCoverages();
    if (coverages.length > 0) {
      return coverages.map(c => c.coverageType);
    }
    return [
      'Medical Expenses', 'Trip Cancellation', 'Baggage Loss',
      'Personal Accident', 'Emergency Evacuation', 'Loss of Passport',
      'Flight Delay', 'Personal Liability'
    ];
  });

  /** The coverage limit for the selected claim type — null if no match */
  selectedCoverageLimit = computed<number | null>(() => {
    const type = this.selectedClaimType();
    const coverages = this.policyCoverages();
    if (!type || coverages.length === 0) return null;
    const match = coverages.find(c =>
      c.coverageType.toLowerCase().trim() === type.toLowerCase().trim()
    );
    console.log(match?.coverageAmount);
    return match ? match.coverageAmount : null;

  });

  /** True when entered amount > coverage limit */
  coverageExceeded = computed<boolean>(() => {
    const limit = this.selectedCoverageLimit();
    const amount = this.enteredAmount();
    return limit !== null && amount > 0 && amount > limit;
  });

  /** Files chosen by user */
  selectedFiles = signal<File[]>([]);
  uploading = signal(false);

  raiseForm = this.fb.nonNullable.group({
    policyId: [0, [Validators.required, Validators.min(1)]],
    claimType: ['', Validators.required],
    claimAmount: [0, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  constructor() {
    this.loadClaims();

    // Mirror form values into signals so computed() reacts to them
    this.raiseForm.get('policyId')!.valueChanges.subscribe(id => {
      this.selectedPolicyId.set(id ?? 0);
      if (id && id > 0) {
        this.policyService.getPolicyCoverages(id).subscribe({
          next: (coverages) => {
            this.policyCoverages.set(coverages);
            // Reset claim type so user picks from updated list
            this.raiseForm.patchValue({ claimType: '' });
            this.selectedClaimType.set('');
          },
          error: () => this.policyCoverages.set([])
        });
      } else {
        this.policyCoverages.set([]);
      }
    });

    this.raiseForm.get('claimType')!.valueChanges.subscribe(type => {
      this.selectedClaimType.set(type ?? '');
    });

    this.raiseForm.get('claimAmount')!.valueChanges.subscribe(amount => {
      this.enteredAmount.set(amount ?? 0);
    });
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
        this.loading.set(false);
      },
    });
  }

  openRaiseForm(): void {
    this.showRaiseForm.set(true);
    this.selectedFiles.set([]);
    this.policyCoverages.set([]);
    this.selectedClaimType.set('');
    this.enteredAmount.set(0);
    this.raiseForm.reset({ policyId: 0, claimType: '', claimAmount: 0, description: '' });
    this.loadActivePolicies();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.selectedFiles.set(Array.from(input.files));
  }

  removeFile(index: number): void {
    const current = [...this.selectedFiles()];
    current.splice(index, 1);
    this.selectedFiles.set(current);
  }

  submitClaim(): void {
    if (this.raiseForm.invalid) return;
    if (this.coverageExceeded()) {
      this.toast.error('Claim amount exceeds the coverage limit for the selected type.');
      return;
    }

    const raw = this.raiseForm.getRawValue();
    this.submitting.set(true);

    const files = this.selectedFiles();
    if (files.length === 0) {
      this.doSubmit(raw.policyId, raw.claimType, raw.claimAmount, raw.description, []);
      return;
    }

    this.uploading.set(true);
    forkJoin(files.map(f => this.uploadService.uploadFile(f))).subscribe({
      next: (responses) => {
        this.uploading.set(false);
        this.doSubmit(raw.policyId, raw.claimType, raw.claimAmount, raw.description, responses.map(r => r.url));
      },
      error: () => {
        this.uploading.set(false);
        this.submitting.set(false);
        this.toast.error('Failed to upload documents. Please try again.');
      }
    });
  }

  private doSubmit(policyId: number, claimType: string, claimAmount: number, description: string, documentUrls: string[]): void {
    this.claimService.raiseClaim({ policyId, claimType, claimAmount, description, documentUrls }).subscribe({
      next: () => {
        this.toast.success('Claim submitted successfully!');
        this.loadClaims();
        this.showRaiseForm.set(false);
        this.selectedFiles.set([]);
        this.raiseForm.reset({ policyId: 0, claimType: '', claimAmount: 0, description: '' });
        this.submitting.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to submit claim');
        this.submitting.set(false);
      },
    });
  }
}
