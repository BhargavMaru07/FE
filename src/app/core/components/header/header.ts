import { Component, inject, input, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../services/auth-service';
import { MatDividerModule } from '@angular/material/divider';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
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
    const name = this.user?.name ?? '';
    return name
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

  navigateToProfile(): void {
    this.router.navigateByUrl(this.profileRoute);
  }

  onLogout(): void {
    this.authService.logoutAndRedirect();
  }
}