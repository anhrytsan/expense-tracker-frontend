import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MonthlyLimit, MonthlyLimitService } from '../../../core/services/monthly-limit.service';
import { NotificationService } from '../../../core/services/notification.service';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MonthlyLimitFormComponent } from '../monthly-limit-form/monthly-limit-form.component';

@Component({
  selector: 'app-monthly-limit-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MonthlyLimitFormComponent,
  ],
  templateUrl: './monthly-limit-list.component.html',
  styleUrl: './monthly-limit-list.component.scss',
})
export class MonthlyLimitListComponent {
  private monthlyLimitService = inject(MonthlyLimitService);
  private notificationService = inject(NotificationService);

  limits = this.monthlyLimitService.limits;
  showForm = signal(false);
  selectedLimit = signal<MonthlyLimit | undefined>(undefined);

  displayedColumns: string[] = ['department', 'period', 'limitAmount', 'spentAmount', 'actions'];

  ngOnInit(): void {
    this.monthlyLimitService.getMonthlyLimits().subscribe();
  }

  onAddNew() {
    this.showForm.set(true);
    this.selectedLimit.set(undefined);
  }

  onEdit(limit: MonthlyLimit) {
    this.showForm.set(true);
    this.selectedLimit.set(limit);
  }

  onFormClose() {
    this.showForm.set(false);
    this.selectedLimit.set(undefined);
  }

  onDelete(limit: MonthlyLimit) {
    const confirmation = confirm(
      `Ви впевнені, що хочете видалити ліміт для відділу "${limit.department.name}" за ${limit.month}/${limit.year}?`
    );
    if (confirmation) {
      this.monthlyLimitService.deleteMonthlyLimit(limit._id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Ліміт успішно видалено!');
        },
        error: (err) => this.notificationService.showError(`Помилка: ${err.error.message}`),
      });
    }
  }
}
