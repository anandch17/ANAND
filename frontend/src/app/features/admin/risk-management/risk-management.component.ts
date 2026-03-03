import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RiskService, DestinationRisk } from '../../../core/services/risk.service';
import { ToastService } from '../../../core/services/toast.service';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
    selector: 'app-risk-management',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, CardComponent],
    templateUrl: './risk-management.component.html'
})
export class RiskManagementComponent {
    private readonly riskService = inject(RiskService);
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);

    loading = signal(true);
    risks = signal<DestinationRisk[]>([]);
    showModal = signal(false);
    editingRisk = signal<DestinationRisk | null>(null);

    form = this.fb.group({
        destination: ['', Validators.required],
        riskMultiplier: [1.0, [Validators.required, Validators.min(0.1)]]
    });

    constructor() {
        this.loadRisks();
    }

    loadRisks() {
        this.loading.set(true);
        this.riskService.getAll().subscribe({
            next: (data) => {
                this.risks.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.toast.error('Failed to load risks');
                this.loading.set(false);
            }
        });
    }

    openModal(risk?: DestinationRisk) {
        if (risk) {
            this.editingRisk.set(risk);
            this.form.patchValue(risk);
        } else {
            this.editingRisk.set(null);
            this.form.reset({ riskMultiplier: 1.0 });
        }
        this.showModal.set(true);
    }

    closeModal() {
        this.showModal.set(false);
    }

    submit() {
        if (this.form.invalid) return;
        const value = this.form.value;

        if (this.editingRisk()) {
            this.riskService.update(this.editingRisk()!.id, { ...this.editingRisk()!, ...value } as DestinationRisk).subscribe({
                next: () => {
                    this.toast.success('Risk updated');
                    this.loadRisks();
                    this.closeModal();
                }
            });
        } else {
            this.riskService.create(value as any).subscribe({
                next: () => {
                    this.toast.success('Risk added');
                    this.loadRisks();
                    this.closeModal();
                }
            });
        }
    }

    deleteRisk(id: number) {
        if (confirm('Are you sure you want to delete this risk factor?')) {
            this.riskService.delete(id).subscribe({
                next: () => {
                    this.toast.success('Risk deleted');
                    this.loadRisks();
                }
            });
        }
    }
}
