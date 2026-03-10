import { Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DecimalPipe, SlicePipe, UpperCasePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { PlanService } from '../../../core/services/plan.service';
import { ToastService } from '../../../core/services/toast.service';
import type { PlanResponseDto, CreatePlanDto, CreateCoverageDto } from '../../../core/models/admin.model';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe, SlicePipe, UpperCasePipe],
  templateUrl: './plans.component.html',
})
export class PlansComponent {
  private readonly fb = inject(FormBuilder);
  private readonly planService = inject(PlanService);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  creating = signal(false);
  plans = signal<PlanResponseDto[]>([]);

  showModal = signal(false);
  editingPlanId = signal<number | null>(null);

  readonly coverageTypes = [
    'Medical Expenses',
    'Trip Cancellation',
    'Baggage Loss',
    'Personal Accident',
    'Emergency Evacuation',
    'Loss of Passport',
    'Flight Delay',
    'Personal Liability'
  ];

  readonly planTypes = [
    'Domestic',
    'International',
    'Student',
    'Senior Citizen',
    'Family',
    'Multi-Trip Annual',
    'Business',
    'Adventure / Sports'
  ];


  form = this.fb.nonNullable.group({
    planName: ['', Validators.required],
    planType: ['', Validators.required],
    maxCoverageAmount: [0, Validators.required],
    isActive: [true],

    coverages: this.fb.array([]),

    premiumRule: this.fb.nonNullable.group({
      basePrice: 100,
      perDayRate: 10,
      ageBelow30Multiplier: 1,
      ageBetween30And50Multiplier: 1.2,
      ageAbove50Multiplier: 1.5,
    }),
  });

  // Reactive form value signal
  formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  get coverages(): FormArray {
    return this.form.get('coverages') as FormArray;
  }

  // Reactive calculations for coverage limits
  totalCoverage = computed(() => {
    const val = this.formValue();
    const rawCoverages = (val?.coverages as any[]) || [];
    return rawCoverages.reduce((sum, c) => sum + (Number(c?.coverageAmount) || 0), 0);
  });

  isLimitExceeded = computed(() => {
    const val = this.formValue();
    const max = Number(val?.maxCoverageAmount) || 0;
    return this.totalCoverage() > max;
  });

  constructor() {
    this.fetchPlans();
  }

  private fetchPlans(): void {
    this.planService.getAllPlans().subscribe({
      next: (list) => {
        this.plans.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreate(): void {
    this.editingPlanId.set(null);
    this.form.reset();
    this.coverages.clear();
    this.addCoverage();
    this.showModal.set(true);
  }

  openEdit(plan: PlanResponseDto): void {
    this.editingPlanId.set(plan.id);
    this.form.patchValue({
      planName: plan.planName,
      planType: plan.planType,
      maxCoverageAmount: plan.maxCoverageAmount,
      isActive: plan.isActive,
      premiumRule: plan.premiumRule,
    });

    this.coverages.clear();
    plan.coverages.forEach(c =>
      this.coverages.push(
        this.fb.group({
          coverageName: c.coverageName,
          coverageAmount: c.coverageAmount
        })
      )
    );

    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  addCoverage(): void {
    this.coverages.push(
      this.fb.group({
        coverageName: ['', Validators.required],
        coverageAmount: [0, Validators.required]
      })
    );
  }

  createOrUpdate(): void {
    if (this.form.invalid || this.isLimitExceeded()) return;

    const raw = this.form.getRawValue();

    const dto: CreatePlanDto = {
      planName: raw.planName,
      planType: raw.planType,
      maxCoverageAmount: raw.maxCoverageAmount,
      isActive: raw.isActive,
      coverages: raw.coverages as CreateCoverageDto[],
      premiumRule: raw.premiumRule,
    };

    this.creating.set(true);

    const request = this.editingPlanId()
      ? this.planService.updatePlan(this.editingPlanId()!, dto)
      : this.planService.createPlan(dto);

    request.subscribe({
      next: () => {
        this.toast.success('Plan created successfully.');
        this.fetchPlans();
        this.showModal.set(false);
        this.creating.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.error?.message ?? 'Failed to save plan');
        this.creating.set(false);
      }
    });
  }

  activate(id: number) {
    this.planService.activatePlan(id).subscribe(() => this.fetchPlans());
  }

  deactivate(id: number) {
    this.planService.deactivatePlan(id).subscribe(() => this.fetchPlans());
  }
}