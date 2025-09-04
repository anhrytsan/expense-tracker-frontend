import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { Department, DepartmentService } from '../../../core/services/department.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select'; // <-- Наш новий модуль для випадаючого списку!
import { CommonModule } from '@angular/common';

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
export class EmployeeCreateComponent {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);

  departments = this.departmentService.departments;

  // Create event 'employeeCreated' and emit this event when department is created
  // For parent component
  @Output() employeeCreated = new EventEmitter<void>();

  employeeForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    position: ['', Validators.required],
    department: ['', Validators.required],
  });

  onSubmit() {
    if (this.employeeForm.valid) {
      this.employeeService.createEmployee(this.employeeForm.getRawValue()).subscribe({
        next: (newEmployee) => {
          console.log('Співробітника успішно створено:', newEmployee);
          this.employeeCreated.emit(); // Notify parent
          this.employeeForm.reset();
        },
        error: (err) => {
          console.error('Error. Cannot create employee:', err);
        },
      });
    }
  }
}
