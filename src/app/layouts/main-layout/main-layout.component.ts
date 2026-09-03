import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  isSidebarOpen = signal(true);
  Role = Role;

  user = computed(() => this.authService.currentUser());

  constructor(public readonly authService: AuthService) {}

  toggleSidebar() {
    this.isSidebarOpen.update((v) => !v);
  }

  logout() {
    this.authService.logout();
  }

  getRoleBadgeClass(role?: Role): string {
    switch (role) {
      case Role.ADMIN:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case Role.COORDINATOR:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case Role.STUDENT:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case Role.COMPANY:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case Role.TUTOR:
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  }
}
