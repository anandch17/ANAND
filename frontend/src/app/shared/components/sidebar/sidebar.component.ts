import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

export interface SidebarItem {
  label: string;
  path: string;
  icon?: string;
  badge?: number | string;
  target?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  readonly auth = inject(AuthService);
  role = input<string>('');
  items = input<SidebarItem[]>([]);
  userName = input<string>('');

  get userInitials(): string {
    return this.userName()
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}