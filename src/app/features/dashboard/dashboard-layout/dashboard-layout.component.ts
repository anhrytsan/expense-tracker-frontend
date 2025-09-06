import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop'; // <-- 1. Імпортуємо toSignal
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';

// Angular CDK
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

// Angular Material & Services...
// ... (решта ваших імпортів)
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);

  // 2. Перетворюємо Observable на сигнал
  isHandset = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((result) => result.matches)),
    { initialValue: false } // Початкове значення, доки Observable не спрацює
  );

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
