// front/src/app/features/departments/department-list/department-list.component.ts

import { Component, OnInit, inject, signal, computed } from '@angular/core'; // Додаємо signal і computed
import { filter } from 'rxjs';
import { Department, DepartmentService } from '../../../core/services/department.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

// ... інші імпорти
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { DepartmentCreateComponent } from '../department-create/department-create.component';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
// --- НОВІ ІМПОРТИ ---
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

// --- НОВИЙ ТИП ДЛЯ ЗРУЧНОСТІ ---
type SortableField = keyof Department | 'limit' | 'spent' | 'carryover' | 'effectiveLimit' | 'available';


@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    DepartmentCreateComponent,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    // --- ДОДАЄМО НОВІ МОДУЛІ ---
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.scss',
})
export class DepartmentListComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  private departments = this.departmentService.departments;

  editingDepartmentId: string | null = null;
  editedDepartmentName: string = '';

  displayedColumns: string[] = ['name', 'numberOfEmployees', 'limit', 'carryover', 'effectiveLimit', 'spent', 'available', 'createdAt', 'actions'];

  // --- НОВА ЛОГІКА СОРТУВАННЯ ---

  // 1. Сигнали для зберігання поточних значень сортування
  sortBy = signal<SortableField>('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // 2. Опції для першого дропдауну
  sortOptions: { value: SortableField; viewValue: string }[] = [
    { value: 'effectiveLimit', viewValue: 'Ефективний ліміт' },
    { value: 'limitAmount', viewValue: 'Ліміт (поточний місяць)' },
    { value: 'spentAmount', viewValue: 'Витрачено (поточний місяць)' },
    { value: 'carryover', viewValue: 'Залишок з минулих місяців' },
    { value: 'available', viewValue: 'Доступно' },
    { value: 'numberOfEmployees', viewValue: 'К-ть співробітників' },
    { value: 'createdAt', viewValue: 'Дата створення' },
  ];

  // 3. Обчислюваний сигнал для опцій другого дропдауну (залежить від sortBy)
  directionOptions = computed(() => {
    if (this.sortBy() === 'createdAt') {
      return [
        { value: 'desc', viewValue: 'Спочатку новіші' },
        { value: 'asc', viewValue: 'Спочатку старіші' },
      ];
    }
    return [
      { value: 'asc', viewValue: 'В порядку зростання' },
      { value: 'desc', viewValue: 'В порядку спадання' },
    ];
  });

  // 4. Обчислюваний сигнал, який повертає відсортований масив
  sortedDepartments = computed(() => {
    const depts = [...this.departments()]; // Створюємо копію, щоб не мутувати оригінал
    const key = this.sortBy();
    const direction = this.sortDirection();

    // Скидаємо напрямок, якщо він не підходить для вибраного поля
    if (key === 'createdAt' && !['asc', 'desc'].includes(direction)) {
      this.sortDirection.set('desc');
    }

    depts.sort((a, b) => {
      // Визначаємо значення для порівняння, враховуючи можливий undefined
      const valA = a[key as keyof Department] ?? 0;
      const valB = b[key as keyof Department] ?? 0;

      let comparison = 0;

      if (key === 'createdAt') {
        comparison = new Date(valA as string).getTime() - new Date(valB as string).getTime();
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return depts;
  });


  ngOnInit(): void {
    this.departmentService.getDepartments().subscribe();
  }

  // --- МЕТОДИ РЕДАГУВАННЯ ТА ВИДАЛЕННЯ ЗАЛИШАЮТЬСЯ БЕЗ ЗМІН ---

  onBlurSave(department: Department): void {
    setTimeout(() => {
      if (this.editingDepartmentId === department._id) {
        this.onSave(department);
      }
    }, 150);
  }

  onEdit(department: Department): void {
    this.editingDepartmentId = department._id;
    this.editedDepartmentName = department.name;
  }

  onCancelEdit(): void {
    this.editingDepartmentId = null;
    this.editedDepartmentName = '';
  }

  onSave(department: Department): void {
    if (!this.editedDepartmentName.trim()) {
      this.notificationService.showError('Назва не може бути порожньою.');
      return;
    }

    this.departmentService.updateDepartment(department._id, this.editedDepartmentName).subscribe({
      next: () => {
        this.notificationService.showSuccess('Назву відділу оновлено!');
        this.onCancelEdit();
      },
      error: (err) => {
        this.notificationService.showError(`Помилка: ${err.error.message}`);
      },
    });
  }

  onDelete(id: string, name: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Підтвердження видалення',
        message: `Ви впевнені, що хочете видалити відділ "${name}"?`,
      },
    });

    dialogRef.afterClosed()
      .pipe(filter(result => result === true))
      .subscribe(() => {
        this.departmentService.deleteDepartment(id).subscribe({
          next: () => {
            this.notificationService.showSuccess(`Відділ "${name}" видалено.`);
          },
          error: (err) => {
            this.notificationService.showError(`Помилка: ${err.error.message}`);
          },
        });
      });
  }
}
