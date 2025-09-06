// front/src/app/features/expenses/expense-create/expense-create.component.ts

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
import { CommonModule } from '@angular/common';

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

// --- Інтерфейс для даних про ліміти відділу ---
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
  styleUrls: ['./expense-create.component.scss'], // Змінив 'styleUrl' на 'styleUrls'
})
export class ExpenseCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);
  private employeeService = inject(EmployeeService);
  private expenseTypeService = inject(ExpenseTypeService);
  private expenseService = inject(ExpenseService);
  private notificationService = inject(NotificationService);

  // --- Сигнали з даними ---
  departments = this.departmentService.departments;
  employees = this.employeeService.allEmployees;
  expenseTypes = this.expenseTypeService.expenseTypes;

  // --- Сигнали для роботи з лімітами ---
  filteredEmployees = signal<Employee[]>([]);
  departmentFunds = signal<DepartmentFunds | null>(null);
  selectedExpenseType = signal<ExpenseType | null>(null);
  isLoadingFunds = signal(false);

  expenseForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [new Date().toISOString(), Validators.required],
    department: ['', Validators.required],
    employee: ['', Validators.required],
    expenseType: ['', Validators.required],
  });

  // --- Сигнали, що відстежують зміни у формі ---
  selectedDepartmentId = toSignal(this.expenseForm.controls.department.valueChanges);
  selectedEmployeeId = toSignal(this.expenseForm.controls.employee.valueChanges);
  selectedExpenseTypeId = toSignal(this.expenseForm.controls.expenseType.valueChanges);

  // --- Новий обчислюваний сигнал для максимальної суми ---
  maxAllowedAmount = computed(() => {
    const funds = this.departmentFunds();
    const type = this.selectedExpenseType();

    if (!funds || !type) {
      return 0;
    }
    // Повертаємо менше з двох значень: доступний ліміт відділу або ліміт типу витрати
    return Math.min(funds.available, type.limit);
  });


  // --- Повідомлення для валідації суми ---
  amountValidationMessage = computed(() => {
    const amount = this.expenseForm.controls.amount.value ?? 0;
    if (amount <= 0) return '';

    const maxAmount = this.maxAllowedAmount();
    if (maxAmount > 0 && amount > maxAmount) {
      // Визначаємо, який саме ліміт було перевищено
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
    // Додаємо валідатор до поля amount
    this.expenseForm.controls.amount.addValidators(this.amountValidator());
  }

  private setupEffects(): void {
    // Фільтрація співробітників при зміні відділу
    effect(() => {
      const departmentId = this.selectedDepartmentId();
      const allEmployees = this.employees();
      this.filteredEmployees.set(
        departmentId ? allEmployees.filter((emp) => emp.department?._id === departmentId) : allEmployees
      );
      const currentEmployeeId = this.expenseForm.getRawValue().employee;
      if (currentEmployeeId && !this.filteredEmployees().some((emp) => emp._id === currentEmployeeId)) {
        this.expenseForm.controls.employee.reset('');
      }
    }, { allowSignalWrites: true });

    // Авто-вибір відділу при виборі співробітника
    effect(() => {
      const employeeId = this.selectedEmployeeId();
      if (employeeId) {
        const employee = this.employees().find((emp) => emp._id === employeeId);
        if (employee?.department && this.expenseForm.controls.department.value !== employee.department._id) {
          this.expenseForm.controls.department.setValue(employee.department._id);
        }
      }
    });

    // Отримання фінансових даних при зміні відділу
    effect(() => {
      const departmentId = this.selectedDepartmentId();
      if (departmentId) {
        this.isLoadingFunds.set(true);
        this.departmentFunds.set(null);
        this.departmentService.getAvailableFunds(departmentId).subscribe({
          next: (funds) => {
            this.departmentFunds.set(funds as DepartmentFunds);
            this.isLoadingFunds.set(false);
            this.expenseForm.controls.amount.updateValueAndValidity();
          },
          error: () => this.isLoadingFunds.set(false),
        });
      } else {
        this.departmentFunds.set(null);
      }
    });

    // Оновлення обраного типу витрат
    effect(() => {
      const typeId = this.selectedExpenseTypeId();
      this.selectedExpenseType.set(this.expenseTypes().find((t) => t._id === typeId) || null);
      this.expenseForm.controls.amount.updateValueAndValidity();
    });
  }

  private loadFormData(): void {
    this.departmentService.getDepartments().subscribe();
    this.employeeService.loadAllEmployeesForForms();
    this.expenseTypeService.getExpenseTypes().subscribe();
  }

  // --- Валідатор для поля суми ---
  private amountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const amount = control.value;
      if (amount <= 0) return null;

      const maxAmount = this.maxAllowedAmount();
      if (maxAmount > 0 && amount > maxAmount) {
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
