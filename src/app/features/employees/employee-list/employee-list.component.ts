import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, startWith } from 'rxjs';

// Services
import { Employee, EmployeeService, UpdateEmployeeDto } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { NotificationService } from '../../../core/services/notification.service';

// Components
import { EmployeeCreateComponent } from '../employee-create/employee-create.component';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    EmployeeCreateComponent
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private notificationService = inject(NotificationService);

  employees = this.employeeService.employees;
  departments = this.departmentService.departments;
  positions = this.employeeService.positions;

  displayedColumns: string[] = ['name', 'position', 'department', 'actions'];

  // --- NEW: State management for editing ---
  editingEmployeeId: string | null = null;
  editForm = {
    name: '',
    position: '',
    department: ''
  };

  // --- NEW: Filter form ---
  filterForm = this.fb.group({
    department: [''],
    position: [''],
  });

  private filtersSignal = toSignal(
    this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      debounceTime(400)
    )
  );

  constructor() {
    effect(() => {
      const filters = this.filtersSignal();
      if (filters) {
        this.loadEmployees(filters);
      }
    });
  }

  ngOnInit(): void {
    this.loadFilterData();
  }

  loadEmployees(filters: any = {}): void {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v != null && v !== '')
    );
    this.employeeService.getEmployees(cleanFilters).subscribe();
  }

  loadFilterData(): void {
    this.departmentService.getDepartments().subscribe();
    this.employeeService.getPositions().subscribe();
  }

  clearFilters(): void {
    this.filterForm.reset({ department: '', position: '' });
  }

  // --- NEW METHODS ---

  onEdit(employee: Employee): void {
    this.editingEmployeeId = employee._id;
    this.editForm = {
      name: employee.name,
      position: employee.position,
      department: employee.department._id
    };
  }

  onCancelEdit(): void {
    this.editingEmployeeId = null;
    this.editForm = { name: '', position: '', department: '' };
  }

  onSave(employeeId: string): void {
    if (!this.editForm.name.trim() || !this.editForm.position.trim()) {
      this.notificationService.showError('Ім\'я та посада не можуть бути порожніми.');
      return;
    }

    const updatedData: UpdateEmployeeDto = {
      name: this.editForm.name,
      position: this.editForm.position,
      department: this.editForm.department
    };

    this.employeeService.updateEmployee(employeeId, updatedData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Дані співробітника оновлено!');
        this.onCancelEdit();
      },
      error: (err) => {
        this.notificationService.showError(`Помилка: ${err.error.message}`);
      },
    });
  }

  onDelete(employee: Employee): void {
    if (confirm(`Ви впевнені, що хочете видалити співробітника "${employee.name}"?`)) {
      this.employeeService.deleteEmployee(employee._id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Співробітника "${employee.name}" видалено.`);
        },
        error: (err) => {
          this.notificationService.showError(`Помилка: ${err.error.message}`);
        },
      });
    }
  }
}
