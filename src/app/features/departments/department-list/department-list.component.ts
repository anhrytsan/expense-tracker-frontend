import { Component, OnInit, inject } from '@angular/core';
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
  ],
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.scss',
})
export class DepartmentListComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  departments = this.departmentService.departments;

  displayedColumns: string[] = ['name', 'numberOfEmployees', 'limit', 'carryover', 'effectiveLimit', 'spent', 'available', 'createdAt', 'actions'];
  editingDepartmentId: string | null = null;
  editedDepartmentName: string = '';

  ngOnInit(): void {
    this.departmentService.getDepartments().subscribe();
  }

  onBlurSave(department: Department): void {
    setTimeout(() => {
      if (this.editingDepartmentId === department._id) {
        this.onSave(department);
      }
    }, 150);
  }

  onEdit(department: Department): void {
    this.editingDepartmentId = department._id;
    this.editedDepartmentName = department.name; // Save current name
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
      .pipe(filter(result => result === true)) // Виконуємо дію тільки якщо натиснули "Так"
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
