import { Component, inject, signal, computed } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CreateUserComponent } from '../create-user/create-user.component';
import type { UserResponseDto } from '../../../core/models/admin.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CardComponent,CreateUserComponent],
  templateUrl: './users.component.html',
})
export class UsersComponent {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  roleFilter = signal<string>('');
  customers = signal<UserResponseDto[]>([]);
  agents = signal<UserResponseDto[]>([]);
  claimOfficers = signal<UserResponseDto[]>([]);
  showCreateModal = signal(false);
selectedRole = signal<'Agent' | 'ClaimOfficer'>('Agent');

  constructor() {
    this.userService.getCustomers().subscribe({
      next: (c) => this.customers.set(c),
      error: () => this.customers.set([]),
    });
    this.userService.getAgents().subscribe({
      next: (a) => this.agents.set(a),
      error: () => this.agents.set([]),
    });
    this.userService.getClaimOfficers().subscribe({
      next: (c) => this.claimOfficers.set(c),
      error: () => this.claimOfficers.set([]),
    });
    this.loading.set(false);
  }

  filteredUsers = computed(() => {
    const role = this.roleFilter();
    const all: UserResponseDto[] = [
      ...this.customers(),
      ...this.claimOfficers(),
      ...this.agents(),
    ];
    if (!role) return all;
    return all.filter((u) => u.role === role);
  });

  filterRole(event: Event): void {
    const sel = event.target as HTMLSelectElement;
    this.roleFilter.set(sel.value);
  }

  activate(id: number): void {
    this.userService.activateUser(id).subscribe({
      next: () => {
        this.toast.success('User activated');
        this.refresh();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Failed'),
    });
  }

  openCreateModal(role: 'Agent' | 'ClaimOfficer') {
  this.selectedRole.set(role);
  this.showCreateModal.set(true);
}

closeModal() {
  this.showCreateModal.set(false);
  this.refresh();
}

  deactivate(id: number): void {
    this.userService.deactivateUser(id).subscribe({
      next: () => {
        this.toast.success('User deactivated');
        this.refresh();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Failed'),
    });
  }

  private refresh(): void {
    this.userService.getCustomers().subscribe((c) => this.customers.set(c));
    this.userService.getAgents().subscribe((a) => this.agents.set(a));
    this.userService.getClaimOfficers().subscribe((c) => this.claimOfficers.set(c));
  }
}
