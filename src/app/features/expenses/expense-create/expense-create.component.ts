import { Component, effect, inject, OnInit } from '@angular/core'; // Додай OnInit
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
import { DepartmentService } from '../../../core/services/department.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { ExpenseTypeService } from '../../../core/services/expense-type.service';
import { ExpenseService } from '../../../core/services/expense.service';

@Component({
  selector: 'app-expense-create',
  standalone: true, // standalone: true вже є, тому не міняємо
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
  // Додай implements OnInit
  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);
  private employeeService = inject(EmployeeService);
  private expenseTypeService = inject(ExpenseTypeService);
  private expenseService = inject(ExpenseService);

  // Signals from services
  departments = this.departmentService.departments;
  employees = this.employeeService.employees;
  expenseTypes = this.expenseTypeService.expenseTypes;

  expenseForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [new Date().toISOString(), Validators.required],
    department: [{ value: '', disabled: true }, Validators.required],
    employee: ['', Validators.required],
    expenseType: ['', Validators.required],
  });

  // LOGIC FOR AUTOSELECTING DEPARTMENT BY EMPLOYEE IN FORM
  selectedEmployeeId = toSignal(this.expenseForm.controls.employee.valueChanges);

  constructor() {
    effect(() => {
      const employeeId = this.selectedEmployeeId();
      const employeeList = this.employees();

      if (employeeId && employeeList.length > 0) {
        const selectedEmployee = employeeList.find((emp) => emp._id === employeeId);

        if (selectedEmployee) {
          this.expenseForm.patchValue({ department: selectedEmployee.department._id });
        }
      }
    });
  }

  // 👇 Ось цей метод ми додаємо
  ngOnInit(): void {
    this.loadFormData();
  }

  // 👇 І цей теж
  loadFormData(): void {
    this.departmentService.getDepartments().subscribe({
      // <-- Додай цей блок
      error: (err) => console.error('Помилка завантаження відділів:', err),
    });
    this.employeeService.getEmployees().subscribe({
      error: (err) => console.error('Помилка завантаження співробітників:', err),
    });
    this.expenseTypeService.getExpenseTypes().subscribe({
      error: (err) => console.error('Помилка завантаження типів витрат:', err),
    });
    // Завантаження відділів тут не обов'язкове, оскільки вони завантажуються разом зі співробітниками
  }

  onSubmit() {
    if (this.expenseForm.valid) {
      this.expenseService.createExpense(this.expenseForm.getRawValue()).subscribe({
        next: () => {
          console.log('Витрату успішно створено!');
          this.expenseForm.reset({ date: new Date().toISOString(), amount: 0 });
        },
        error: (err) => {
          console.error('Помилка створення витрати:', err);
        },
      });
    }
  }
}
