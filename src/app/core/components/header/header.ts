import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth-service';
import { DropdownComponent, DropdownItem } from '../../../shared/components/dropdown/dropdown';
import { NotificationDropdownComponent, NotificationItem } from '../../../shared/components/notification-dropdown/notification-dropdown';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    DropdownComponent,
    NotificationDropdownComponent,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  readonly sidebarCollapsed = input<boolean>(false);
  readonly toggleSidebar = output<void>();

  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  get user() {
    return this.authService.currentUser();
  }

  get initials(): string {
    return (this.user?.name ?? '')
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  get profileRoute(): string {
    switch (this.user?.role) {
      case 'Administrator': return '/admin/profile';
      case 'WarehouseManager': return '/manager/profile';
      case 'StockKeeper': return '/stock-keeper/profile';
      default: return '/';
    }
  }

  get profileItems(): DropdownItem[] {
    return [
      {
        label: 'My Profile',
        icon: 'bi-person',
        action: () => this.router.navigateByUrl(this.profileRoute),
      },
      {
        label: 'Sign Out',
        icon: 'bi-box-arrow-right',
        danger: true,
        dividerBefore: true,
        action: () => this.authService.logoutAndRedirect(),
      },
    ];
  }

  readonly notifications: NotificationItem[] = [
    {
      id: 1,
      title: 'Low stock alert: SKU-1001',
      description: 'Current quantity: 15 units',
      read: false,
    },
    {
      id: 2,
      title: 'PO-2024-001 approved',
      description: 'Purchase order ready for processing',
      read: false,
    },
    {
      id: 3,
      title: 'Stock transfer completed',
      description: '50 items moved to Regional Hub',
      read: true,
    },
  ];
}