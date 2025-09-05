import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyLimit, MonthlyLimitService } from '../../../core/services/monthly-limit.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DepartmentService } from '../../../core/services/department.service';

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

  // Original signals from services
  private limits = this.monthlyLimitService.limits;
  private departments = this.departmentService.departments;

  // State for form visibility
  showForm = signal(false);
  selectedLimit = signal<MonthlyLimit | undefined>(undefined);

  // Computed signal to merge data from limits and departments
  limitsWithData = computed(() => {
    const limits = this.limits();
    const departments = this.departments();

    // If departments data is not loaded yet, return empty array
    if (!departments.length) {
      return [];
    }

    return limits.map(limit => {
      // Find the corresponding department for the current limit
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
    // Load both limits and full department data
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
