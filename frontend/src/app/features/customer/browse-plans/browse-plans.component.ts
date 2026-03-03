import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PlanService } from '../../../core/services/plan.service';
import { PolicyService } from '../../../core/services/policy.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { OnInit } from '@angular/core';
import { CardComponent } from '../../../shared/components/card/card.component';
import type { BrowsePlanDto } from '../../../core/models/policy.model';

@Component({
  selector: 'app-browse-plans',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, DecimalPipe],
  templateUrl: './browse-plans.component.html',
})
export class BrowsePlansComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly planService = inject(PlanService);
  private readonly policyService = inject(PolicyService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);

  loading = signal(false);
  interestLoading = signal(false);
  searched = signal(false);
  plans = signal<BrowsePlanDto[]>([]);
  destinationRisks = signal<any[]>([]);
  userDob = signal<string | null>(null);
  existingPolicies = signal<any[]>([]);
  searchForm = this.fb.nonNullable.group({
    coverageType: ['', Validators.required],
    planType: ['', Validators.required],
    destination: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (profile: any) => {
        if (profile.dateOfBirth) {
          this.userDob.set(profile.dateOfBirth);
        }
      },
      error: (err: any) => {
        console.error('Failed to load profile', err);
      }
    });

    this.loadExistingPolicies();
  }

  loadExistingPolicies(): void {
    this.policyService.getMyPolicies().subscribe({
      next: (policies) => {
        this.existingPolicies.set(policies);
      },
      error: (err) => {
        console.error('Failed to load existing policies', err);
      }
    });
  }

  getPlanStatus(planId: number): string {
    const policy = this.existingPolicies().find(p => p.planId === planId);
    if (!policy) return '';

    // Map backend status to user-friendly text
    switch (policy.status) {
      case 'Interested': return 'Interested';
      case 'PendingAgentApproval': return 'Under Review';
      case 'PaymentPending': return 'Payment Pending';
      case 'Active': return 'Already Active';
      default: return '';
    }
  }

  isPlanProceedDisabled(planId: number): boolean {
    const status = this.getPlanStatus(planId);
    return status !== '';
  }

  coverageTypes = [
    'Medical Expenses',
    'Trip Cancellation',
    'Baggage Loss',
    'Personal Accident',
    'Emergency Evacuation',
    'Loss of Passport',
    'Flight Delay',
    'Personal Liability'
  ];
  planTypes = [
    'Domestic',
    'International',
    'Student',
    'Senior Citizen',
    'Family',
    'Multi-Trip Annual',
    'Business',
    'Adventure / Sports'
  ];

  get tripDays(): number {
    const { startDate, endDate } = this.searchForm.getRawValue();
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  get userAge(): number {
    const dob = this.userDob();
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  search(): void {
    if (this.searchForm.invalid) return;
    this.loading.set(true);
    this.searched.set(true);
    const { coverageType, planType } = this.searchForm.getRawValue();

    this.planService.browsePlans(coverageType).subscribe({
      next: (list) => {
        // Internal Filtering based on Plan Type and DOB
        let filtered = list.filter(p => p.planType === planType);

        const age = this.userAge;
        if (age < 30) {
          // If student age (< 30), prioritize student plans
          filtered = filtered.sort((a, b) => a.planName.toLowerCase().includes('student') ? -1 : 1);
        } else if (age >= 30 && age <= 50) {
          // If standard age (30-50), prioritize regular/standard plans
          filtered = filtered.sort((a, b) => (a.planName.toLowerCase().includes('standard') || a.planName.toLowerCase().includes('regular')) ? -1 : 1);
        } else {
          // If senior age (> 50), prioritize senior plans
          filtered = filtered.sort((a, b) => a.planName.toLowerCase().includes('senior') ? -1 : 1);
        }

        this.plans.set(filtered);
        this.updatePlanPremiums();
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? err.message ?? 'Failed to load plans');
        this.loading.set(false);
      },
    });
  }

  private updatePlanPremiums(): void {
    const { destination } = this.searchForm.getRawValue();
    const days = this.tripDays;
    const age = this.userAge;

    this.plans().forEach(plan => {
      this.planService.calculatePremium({
        planId: plan.planId,
        age: age,
        travelDays: days,
        destinationCountry: destination
      }).subscribe({
        next: (res) => {
          this.plans.update(currentPlans => {
            return currentPlans.map(p => {
              if (p.planId === plan.planId) {
                return {
                  ...p,
                  calculatedPremium: res.finalPremium,
                  dynamicCoverages: res.dynamicCoverages
                };
              }
              return p;
            });
          });
        }
      });
    });
  }

  expressInterest(plan: BrowsePlanDto): void {
    const age = this.userAge;

    // 1. Student Plan Age Limit (38)
    if (plan.planName.toLowerCase().includes('student') && age > 38) {
      this.toast.error('Age limit exceeded. Student plans are only available for individuals aged 38 or below.');
      return;
    }

    const { destination, startDate, endDate } = this.searchForm.getRawValue();
    this.interestLoading.set(true);
    this.policyService
      .requestPolicy({
        planId: plan.planId,
        destinationCountry: destination,
        startDate,
        endDate,
      })
      .subscribe({
        next: () => {
          this.toast.success('Interest recorded! You can track its approval in "My Policies".');
          this.interestLoading.set(false);
          this.loadExistingPolicies();
        },
        error: (err) => {
          this.toast.error(err.error?.message ?? err.message ?? 'Failed to submit interest');
          this.interestLoading.set(false);
        },
      });
  }
}
