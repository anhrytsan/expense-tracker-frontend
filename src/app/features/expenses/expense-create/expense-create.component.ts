import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { forkJoin } from 'rxjs'; // import forkJoin for parallel requests

// --- Angular Material Modules ---
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// --- Services & Models ---
import { Department, DepartmentService } from '../../../core/services/department.service';
import { Employee, EmployeeService } from '../../../core/services/employee.service';
import { ExpenseTypeService } from '../../../core/services/expense-type.service';
import { ExpenseService, ExpenseType } from '../../../core/services/expense.service';
import { NotificationService } from '../../../core/services/notification.service';

// Interface for department funds data
interface DepartmentFunds {
  limitAmount: number;
  spentAmount: number;
  carryover: number;
  effectiveLimit: number;
  available: number;
}

@Component({
  selector: 'app-expense-create',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './expense-create.component.html',
  styleUrls: ['./expense-create.component.scss'],
})
export class ExpenseCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);
  private employeeService = inject(EmployeeService);
  private expenseTypeService = inject(ExpenseTypeService);
  private expenseService = inject(ExpenseService);
  private notificationService = inject(NotificationService);

  departments = this.departmentService.departments;
  employees = this.employeeService.allEmployees;
  expenseTypes = this.expenseTypeService.expenseTypes;

  filteredEmployees = signal<Employee[]>([]);
  departmentFunds = signal<DepartmentFunds | null>(null);
  selectedExpenseType = signal<ExpenseType | null>(null);
  isLoadingFunds = signal(false);
  isInitialDataLoading = signal(true); // Signal for initial data loading state

  expenseForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [new Date().toISOString(), Validators.required],
    department: ['', Validators.required],
    employee: ['', Validators.required],
    expenseType: ['', Validators.required],
  });

  // Getter for easy access to amount control
  get amount() {
    return this.expenseForm.controls.amount;
  }

  selectedDepartmentId = toSignal(this.expenseForm.controls.department.valueChanges);
  selectedEmployeeId = toSignal(this.expenseForm.controls.employee.valueChanges);
  selectedExpenseTypeId = toSignal(this.expenseForm.controls.expenseType.valueChanges);

  // Computed for maximum allowed amount based on department funds and expense type limit
  maxAllowedAmount = computed(() => {
    const funds = this.departmentFunds();
    const type = this.selectedExpenseType();
    if (funds === null || type === null) {
      return null; // Return null if data not ready
    }
    return Math.min(funds.available, type.limit);
  });

  // Message for amount validation
  amountValidationMessage = computed(() => {
    const amount = this.amount.value ?? 0;
    if (amount <= 0) return '';

    const maxAmount = this.maxAllowedAmount();
    if (maxAmount === null) return ''; // Data not ready yet

    if (amount > maxAmount) {
      if (maxAmount === 0) {
        return 'Витрати неможливі, доступний ліміт 0 грн';
      }
      const funds = this.departmentFunds();
      const type = this.selectedExpenseType();
      if (funds && amount > funds.available) {
        return `Перевищено доступний ліміт відділу (${funds.available} грн)`;
      }
      if (type && amount > type.limit) {
        return `Перевищено ліміт транзакції для цього типу (${type.limit} грн)`;
      }
    }
    return '';
  });

  constructor() {
    this.setupEffects();
  }

  ngOnInit(): void {
    this.loadFormData();
    this.amount.addValidators(this.amountValidator());
  }

  private setupEffects(): void {
    // Employee list depends on selected department
    effect(
      () => {
        const departmentId = this.selectedDepartmentId();
        const allEmployees = this.employees();
        this.filteredEmployees.set(
          departmentId
            ? allEmployees.filter((emp) => emp.department?._id === departmentId)
            : allEmployees
        );
        const currentEmployeeId = this.expenseForm.getRawValue().employee;
        if (
          currentEmployeeId &&
          !this.filteredEmployees().some((emp) => emp._id === currentEmployeeId)
        ) {
          this.expenseForm.controls.employee.reset('');
        }
      },
      { allowSignalWrites: true }
    );

    // Auto-select department when employee changes
    effect(() => {
      const employeeId = this.selectedEmployeeId();
      if (employeeId) {
        const employee = this.employees().find((emp) => emp._id === employeeId);
        if (
          employee?.department &&
          this.expenseForm.controls.department.value !== employee.department._id
        ) {
          this.expenseForm.controls.department.setValue(employee.department._id);
        }
      }
    });

    // Get finance data when department changes
    effect(() => {
      const departmentId = this.selectedDepartmentId();
      if (departmentId) {
        this.isLoadingFunds.set(true);
        this.departmentFunds.set(null);
        this.departmentService.getAvailableFunds(departmentId).subscribe({
          next: (funds) => {
            this.departmentFunds.set(funds as DepartmentFunds);
            this.isLoadingFunds.set(false);
            this.amount.updateValueAndValidity();
          },
          error: () => this.isLoadingFunds.set(false),
        });
      } else {
        this.departmentFunds.set(null);
      }
    });

    // Update selected expense type
    effect(() => {
      const typeId = this.selectedExpenseTypeId();
      this.selectedExpenseType.set(this.expenseTypes().find((t) => t._id === typeId) || null);
      this.amount.updateValueAndValidity();
    });
  }

  // Load initial data for the form
  private loadFormData(): void {
    forkJoin({
      departments: this.departmentService.getDepartments(),
      employees: this.employeeService.loadAllEmployeesForForms(),
      expenseTypes: this.expenseTypeService.getExpenseTypes(),
    }).subscribe({
      next: () => {
        this.isInitialDataLoading.set(false);
      },
      error: (err) => {
        this.isInitialDataLoading.set(false);
        this.notificationService.showError('Не вдалося завантажити дані для форми.');
        console.error(err);
      },
    });
  }

  // Validator for amount field
  private amountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const amount = control.value;
      const maxAmount = this.maxAllowedAmount();

      if (maxAmount === null || amount <= 0) {
        return null;
      }

      if (amount > maxAmount) {
        return { maxAmountExceeded: true };
      }

      return null;
    };
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
