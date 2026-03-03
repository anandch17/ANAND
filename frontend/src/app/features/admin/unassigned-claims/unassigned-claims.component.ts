import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClaimService } from '../../../core/services/claim.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { UserResponseDto } from '../../../core/models/admin.model';
import { ClaimListDto } from '../../../core/models/admin.model';

@Component({
    selector: 'app-unassigned-claims',
    standalone: true,
    imports: [CommonModule, CardComponent],
    templateUrl: './unassigned-claims.component.html'
})
export class UnassignedClaimsComponent {
    private readonly claimService = inject(ClaimService);
    private readonly userService = inject(UserService);
    private readonly toast = inject(ToastService);

    loading = signal(true);
    claims = signal<ClaimListDto[]>([]);
    officers = signal<UserResponseDto[]>([]);
    assigning = signal<number | null>(null);

    constructor() {
        this.loadData();
    }

    loadData() {
        this.loading.set(true);
        // Load unassigned claims and claim officers in parallel
        this.claimService.getUnassignedClaims().subscribe({
            next: (data) => {
                this.claims.set(data);
                this.checkLoading();
            },
            error: () => this.toast.error('Failed to load claims')
        });

        this.userService.getClaimOfficers().subscribe({
            next: (data) => {
                this.officers.set(data);
                this.checkLoading();
            },
            error: () => this.toast.error('Failed to load officers')
        });
    }

    private checkLoading() {
        // Simple check - both should be loaded or failed
        if (this.claims().length >= 0 && this.officers().length >= 0) {
            this.loading.set(false);
        }
    }

    assignClaim(claimId: number, event: Event) {
        const officerIdStr = (event.target as HTMLSelectElement).value;
        if (!officerIdStr) return;
        const officerId = parseInt(officerIdStr, 10);

        this.assigning.set(claimId);
        this.claimService.assignOfficer(claimId, officerId).subscribe({
            next: () => {
                this.toast.success('Claim assigned successfully');
                this.claims.update(list => list.filter(c => c.id !== claimId));
                this.assigning.set(null);
            },
            error: () => {
                this.toast.error('Failed to assign claim');
                this.assigning.set(null);
            }
        });
    }
}
