import { Component, effect, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Angular Material Modules
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
export class ExpenseCreateComponent {
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
  // Created signal from changes in 'employee field'
  selectedEmployeeId = toSignal(this.expenseForm.controls.employee.valueChanges);
  // Now effect can listen both signals: this.employees() and selectedEmployeeId()

  constructor() {
    effect(() => {
      const employeeId = this.selectedEmployeeId();
      const employeeList = this.employees();

      // Work only if both signals have values
      if (employeeId && employeeList.length > 0) {
        const selectedEmployee = employeeList.find((emp) => emp._id === employeeId);

        if (selectedEmployee) {
          this.expenseForm.patchValue({ department: selectedEmployee.department._id });
        }
      }
    });
  }

  ngOnInit(): void {
    // Load initial data for dropdowns
    this.departmentService.getDepartments().subscribe();
    this.employeeService.getEmployees().subscribe();
    this.expenseTypeService.getExpenseTypes().subscribe();
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
