import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';


@Component({
  selector: 'app-employee-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    CommonModule,
  ],
  templateUrl: './employee-create.component.html',
  styleUrl: './employee-create.component.scss',
})
export class EmployeeCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private notificationService = inject(NotificationService);

  departments = this.departmentService.departments;

  employeeForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    position: ['', Validators.required],
    department: ['', Validators.required],
  });

  ngOnInit(): void {
    this.departmentService.getDepartments().subscribe();
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      this.employeeService.createEmployee(this.employeeForm.getRawValue()).subscribe({
        next: (newEmployee) => {
          this.notificationService.showSuccess(`Співробітника "${newEmployee.name}" успішно створено!`);
          this.employeeForm.reset();
        },
        error: (err) => {
          this.notificationService.showError(`Помилка: ${err.error.message}`);
        },
      });
    }
  }
}
