import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser;
}
