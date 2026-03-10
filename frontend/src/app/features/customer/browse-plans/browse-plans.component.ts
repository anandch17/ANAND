import { Component, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { PlanService } from '../../../core/services/plan.service';
import { PolicyService } from '../../../core/services/policy.service';
import { UserService } from '../../../core/services/user.service';
import { RiskService } from '../../../core/services/risk.service';
import { ToastService } from '../../../core/services/toast.service';
import { OnInit } from '@angular/core';
import { CardComponent } from '../../../shared/components/card/card.component';
import type { BrowsePlanDto } from '../../../core/models/policy.model';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-browse-plans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, DecimalPipe, DatePipe, NgClass],
  templateUrl: './browse-plans.component.html',
})
export class BrowsePlansComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly planService = inject(PlanService);
  private readonly policyService = inject(PolicyService);
  private readonly userService = inject(UserService);
  private readonly riskService = inject(RiskService);
  private readonly toast = inject(ToastService);
  today = new Date().toISOString().split('T')[0];

  PLAN_VALIDATION_RULES: Record<string, { min: number, max: number, minAge?: number, maxAge?: number }> = {
    'Domestic': { min: 1, max: 5 },
    'International': { min: 1, max: 5 },
    'Student': { min: 1, max: 1, maxAge: 29 }, // <30 means max 29
    'Senior Citizen': { min: 1, max: 1, minAge: 50 },
    'Family': { min: 2, max: 5 },
    'Multi-Trip Annual': { min: 1, max: 1 },
    'Business': { min: 1, max: 5, minAge: 30 },
    'Adventure / Sports': { min: 1, max: 4, maxAge: 49 } // <50 means max 49
  };

  loading = signal(false);
  interestLoading = signal(false);
  searched = signal(false);
  plans = signal<BrowsePlanDto[]>([]);
  destinationRisks = signal<any[]>([]);
  userDob = signal<string | null>(null);
  existingPolicies = signal<any[]>([]);

  selectedPlan = signal<BrowsePlanDto | null>(null);
  currentStep = signal<number>(1);
  travelerTypes = ['Adult', 'Student', 'Senior', 'Child'];
  travelerForm = this.fb.group({
    travelers: this.fb.array([])
  });

  searchForm = this.fb.nonNullable.group(
    {
      coverageType: ['', Validators.required],
      planType: ['', Validators.required],
      destination: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    },
    { validators: this.dateRangeValidator }
  );

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

    this.riskService.getAll().subscribe({
      next: (list) => this.destinationRisks.set(list),
      error: () => this.toast.error('Failed to load destinations')
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

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {

    const start = control.get('startDate')?.value;
    const end = control.get('endDate')?.value;

    if (!start || !end) return null;

    if (new Date(end) < new Date(start)) {
      return { invalidDateRange: true };
    }

    return null;
  }

  get tripDays(): number {
    const { startDate, endDate } = this.searchForm.getRawValue();
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  get maxEndDate(): string {
    const start = this.searchForm.get('startDate')?.value;
    if (!start) return '';
    const date = new Date(start);
    date.setDate(date.getDate() + 180);
    return date.toISOString().split('T')[0];
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
          filtered = filtered.sort((a, b) => a.planType.toLowerCase().includes('student') ? -1 : 1);
        } else if (age >= 30 && age <= 50) {
          // If standard age (30-50), prioritize regular/standard plans
          filtered = filtered.sort((a, b) => (a.planType.toLowerCase().includes('standard') || a.planName.toLowerCase().includes('regular')) ? -1 : 1);
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

  get travelers(): FormArray {
    return this.travelerForm.get('travelers') as FormArray;
  }

  getAgeFromDob(dob: string): number {
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

  travelerAgeValidator(planType: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const dob = control.get('dateOfBirth')?.value;
      if (!dob) return null;

      const age = this.getAgeFromDob(dob);
      const rules = this.PLAN_VALIDATION_RULES[planType];
      if (!rules) return null;

      if (rules.minAge !== undefined && age < rules.minAge) {
        return { tooYoung: { required: rules.minAge, actual: age } };
      }
      if (rules.maxAge !== undefined && age > rules.maxAge) {
        return { tooOld: { required: rules.maxAge, actual: age } };
      }

      return null;
    };
  }

  createTravelerGroup(planType: string): FormGroup {
    return this.fb.group({
      fullName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      aadharcard: ['', [Validators.required, Validators.pattern('^[2-9]{1}[0-9]{3}\\s?[0-9]{4}\\s?[0-9]{4}$')]],
      travelerType: ['Adult', Validators.required],
      relationship: ['']
    }, { validators: this.travelerAgeValidator(planType) });
  }

  addTraveler(): void {
    const plan = this.selectedPlan();
    if (!plan) return;

    const rules = this.PLAN_VALIDATION_RULES[plan.planType];
    const maxTravelers = rules?.max ?? 1;

    if (this.travelers.length < maxTravelers) {
      this.travelers.push(this.createTravelerGroup(plan.planType));
    } else {
      this.toast.error(`Maximum ${maxTravelers} traveler(s) allowed for ${plan.planType} plan.`);
    }
  }

  removeTraveler(index: number): void {
    if (this.travelers.length > 1) {
      this.travelers.removeAt(index);
    }
  }

  goToTravelerStep(plan: BrowsePlanDto): void {
    const age = this.userAge;
    const rules = this.PLAN_VALIDATION_RULES[plan.planType];

    if (rules) {
      if (rules.minAge !== undefined && age < rules.minAge) {
        this.toast.error(`Minimum age required for ${plan.planType} is ${rules.minAge}. Your age is ${age}.`);
        return;
      }
      if (rules.maxAge !== undefined && age > rules.maxAge) {
        this.toast.error(`Maximum age allowed for ${plan.planType} is ${rules.maxAge}. Your age is ${age}.`);
        return;
      }
    }

    this.travelerForm.reset();
    this.travelers.clear();

    const primaryTraveler = this.createTravelerGroup(plan.planType);
    // Default values if possible
    this.userService.getProfile().subscribe({
      next: (profile: any) => {
        primaryTraveler.patchValue({
          fullName: profile.fullName || '',
          dateOfBirth: profile.dateOfBirth || '',
        });
      }
    });

    this.travelers.push(primaryTraveler);
    this.selectedPlan.set(plan);
    this.currentStep.set(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToReviewStep(): void {
    if (this.travelerForm.invalid) {
      this.travelerForm.markAllAsTouched();
      return;
    }

    const plan = this.selectedPlan();
    if (plan) {
      const rules = this.PLAN_VALIDATION_RULES[plan.planType];
      if (rules && this.travelers.length < rules.min) {
        this.toast.error(`Minimum ${rules.min} traveler(s) required for ${plan.planType} plan.`);
        return;
      }
    }

    this.currentStep.set(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    const step = this.currentStep();
    if (step > 1) {
      this.currentStep.set(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  cancelPurchase(): void {
    this.selectedPlan.set(null);
    this.currentStep.set(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  confirmPurchase(): void {
    const plan = this.selectedPlan();
    if (!plan) return;

    const { destination, startDate, endDate } = this.searchForm.getRawValue();
    const travelersData = this.travelers.getRawValue();

    this.interestLoading.set(true);
    this.policyService
      .requestPolicy({
        planId: plan.planId,
        destinationCountry: destination,
        startDate,
        endDate,
        travelers: travelersData
      })
      .subscribe({
        next: () => {
          this.toast.success('Interest recorded! You can track its approval in "My Policies".');
          this.interestLoading.set(false);
          this.cancelPurchase();
          this.loadExistingPolicies();
        },
        error: (err) => {
          this.toast.error(err.error?.message ?? err.message ?? 'Failed to submit interest');
          this.interestLoading.set(false);
        },
      });
  }

  expressInterest(plan: BrowsePlanDto): void {
    const age = this.userAge;
    const rules = this.PLAN_VALIDATION_RULES[plan.planType];

    if (rules) {
      if (rules.minAge !== undefined && age < rules.minAge) {
        this.toast.error(`Minimum age required for ${plan.planType} is ${rules.minAge}.`);
        return;
      }
      if (rules.maxAge !== undefined && age > rules.maxAge) {
        this.toast.error(`Maximum age allowed for ${plan.planType} is ${rules.maxAge}.`);
        return;
      }
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

  onAadharInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits

    // Add space after every 4 digits
    if (value.length > 0) {
      value = value.match(/.{1,4}/g)?.join(' ') || value;
    }

    // Limit to 14 characters (12 digits + 2 spaces)
    if (value.length > 14) {
      value = value.substring(0, 14);
    }

    // Update input value so formatting is immediate
    input.value = value;

    // Update form control value manually
    this.travelers.at(index).get('aadharcard')?.setValue(value, { emitEvent: false });
  }
}
