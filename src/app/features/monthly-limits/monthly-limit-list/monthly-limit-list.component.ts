import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MonthlyLimit, MonthlyLimitService } from '../../../core/services/monthly-limit.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DepartmentService } from '../../../core/services/department.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

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
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MonthlyLimitFormComponent,
  ],
  templateUrl: './monthly-limit-list.component.html',
  styleUrl: './monthly-limit-list.component.scss',
})
export class MonthlyLimitListComponent implements OnInit {
  private monthlyLimitService = inject(MonthlyLimitService);
  private notificationService = inject(NotificationService);
  private departmentService = inject(DepartmentService);
  private dialog = inject(MatDialog); // Інжектуємо сервіс діалогів

  private limits = this.monthlyLimitService.limits;
  private departments = this.departmentService.departments;

  showForm = signal(false);
  selectedLimit = signal<MonthlyLimit | undefined>(undefined);

  limitsWithData = computed(() => {
    const limits = this.limits();
    const departments = this.departments();
    if (!departments.length) {
      return [];
    }
    return limits.map(limit => {
      const departmentData = departments.find(d => d._id === limit.department?._id);
      return {
        ...limit,
        carryover: departmentData?.carryover,
        effectiveLimit: departmentData?.effectiveLimit,
        available: departmentData?.available
      };
    });
  });

  displayedColumns: string[] = ['department', 'period', 'limitAmount', 'carryover', 'effectiveLimit', 'spentAmount', 'available', 'actions'];

  ngOnInit(): void {
    this.monthlyLimitService.getMonthlyLimits().subscribe();
    this.departmentService.getDepartments().subscribe();
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
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Підтвердження видалення',
        message: `Ви впевнені, що хочете видалити ліміт для відділу "${limit.department.name}" за ${limit.month}/${limit.year}?`,
      },
    });

    dialogRef.afterClosed()
      .pipe(filter(result => result === true))
      .subscribe(() => {
        this.monthlyLimitService.deleteMonthlyLimit(limit._id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Ліміт успішно видалено!');
          },
          error: (err) => this.notificationService.showError(`Помилка: ${err.error.message}`),
        });
      });
  }
}
