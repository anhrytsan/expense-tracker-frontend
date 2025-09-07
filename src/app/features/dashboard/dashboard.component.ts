import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    MatProgressBarModule,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);

  user = this.authService.currentUser;
  summary = this.dashboardService.summary;

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe();
  }

  // Percent calculation for progress bar
  calculateProgress(spent: number, limit: number): number {
    if (limit === 0) {
      return 100; // If limit is 0, show full progress to indicate no limit set
    }
    return (spent / limit) * 100;
  }
}
