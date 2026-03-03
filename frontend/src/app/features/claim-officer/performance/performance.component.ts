import { Component, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ClaimService } from '../../../core/services/claim.service';
import { ClaimOfficerPerformance } from '../../../core/models/claim.model';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
    selector: 'app-performance',
    standalone: true,
    imports: [CommonModule, DecimalPipe, CardComponent],
    templateUrl: './performance.component.html'
})
export class PerformanceComponent {
    private readonly claimService = inject(ClaimService);

    loading = signal(true);
    stats = signal<ClaimOfficerPerformance | null>(null);

    constructor() {
        this.loadStats();
    }

    loadStats() {
        this.claimService.getOfficerPerformance().subscribe({
            next: (data) => {
                this.stats.set(data);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }
}
