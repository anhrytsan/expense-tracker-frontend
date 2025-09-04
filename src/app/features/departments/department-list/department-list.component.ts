import { Component, OnInit, inject, signal } from '@angular/core';
import { Department, DepartmentService } from '../../../core/services/department.service';
import { NotificationService } from '../../../core/services/notification.service';

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
  styleUrl: './department-list.component.scss'
})
export class DepartmentListComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private notificationService = inject(NotificationService);

  departments = this.departmentService.departments;

  // Array with the names of the columns we want to display
  displayedColumns: string[] = ['name', 'numberOfEmployees', 'createdAt', 'actions'];

  // Editing management
  editingDepartmentId: string | null = null;
  editedDepartmentName: string = '';

  // Request departments initial data after component created
  ngOnInit(): void {
    // Ask service to load data on init.
    this.departmentService.getDepartments().subscribe()
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe();
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
    if (confirm(`Ви впевнені, що хочете видалити відділ "${name}"?`)) {
      this.departmentService.deleteDepartment(id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Відділ "${name}" видалено.`);
        },
        error: (err) => {
          this.notificationService.showError(`Помилка: ${err.error.message}`);
        },
      });
    }
  }
}
