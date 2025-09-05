import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Services
import { Department, DepartmentService } from '../../../core/services/department.service';
import { Employee, EmployeeService } from '../../../core/services/employee.service';
import { ExpenseTypeService } from '../../../core/services/expense-type.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-expense-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './expense-create.component.html',
  styleUrl: './expense-create.component.scss',
})
export class ExpenseCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);
  private employeeService = inject(EmployeeService);
  private expenseTypeService = inject(ExpenseTypeService);
  private expenseService = inject(ExpenseService);
  private notificationService = inject(NotificationService);

  // Signals from services
  departments = this.departmentService.departments;
  employees = this.employeeService.employees;
  expenseTypes = this.expenseTypeService.expenseTypes;

  // Signal for the filtered list of employees
  filteredEmployees = signal<Employee[]>([]);

  expenseForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [new Date().toISOString(), Validators.required],
    department: ['', Validators.required],
    employee: ['', Validators.required],
    expenseType: ['', Validators.required],
  });

  // Signals for form value changes
  selectedDepartmentId = toSignal(this.expenseForm.controls.department.valueChanges);
  selectedEmployeeId = toSignal(this.expenseForm.controls.employee.valueChanges);

  constructor() {
    // Initialize or update the filtered list when the main employee list changes
    effect(() => {
      const allEmployees = this.employees();
      this.filteredEmployees.set(allEmployees);
    });

    // Filter employees when a department is selected
    effect(
      () => {
        const departmentId = this.selectedDepartmentId();
        const allEmployees = this.employees();

        if (!departmentId) {
          this.filteredEmployees.set(allEmployees);
        } else {
          const filtered = allEmployees.filter((emp) => emp.department?._id === departmentId);
          this.filteredEmployees.set(filtered);

          const currentEmployeeId = this.expenseForm.getRawValue().employee;
          if (currentEmployeeId && !filtered.some((emp) => emp._id === currentEmployeeId)) {
            this.expenseForm.controls.employee.reset('');
          }
        }
      },
      { allowSignalWrites: true }
    );

    // Auto-select department when an employee is selected
    effect(() => {
      const employeeId = this.selectedEmployeeId();
      const allEmployees = this.employees();

      if (employeeId && allEmployees.length > 0) {
        const selectedEmployee = allEmployees.find((emp) => emp._id === employeeId);
        if (selectedEmployee?.department) {
          const departmentControl = this.expenseForm.controls.department;
          if (departmentControl.value !== selectedEmployee.department._id) {
            departmentControl.setValue(selectedEmployee.department._id);
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadFormData();
  }

  loadFormData(): void {
    this.departmentService.getDepartments().subscribe({
      error: (err) => console.error('Помилка завантаження відділів:', err),
    });
    this.employeeService.getEmployees().subscribe({
      error: (err) => console.error('Помилка завантаження співробітників:', err),
    });
    this.expenseTypeService.getExpenseTypes().subscribe({
      error: (err) => console.error('Помилка завантаження типів витрат:', err),
    });
  }

  onSubmit() {
    if (this.expenseForm.valid) {
      this.expenseService.createExpense(this.expenseForm.getRawValue()).subscribe({
        next: () => {
          this.notificationService.showSuccess('Витрату успішно створено!');
          this.expenseForm.reset({
            date: new Date().toISOString(),
            amount: 0,
            department: '',
            employee: '',
            expenseType: '',
          });
        },
        error: (err) => {
          const message = err.error.message || 'Невідома помилка';
          this.notificationService.showError(`Помилка створення витрати: ${message}`);
        },
      });
    }
  }
}
