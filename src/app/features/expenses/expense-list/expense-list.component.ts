import { Component, OnInit, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop'; // <-- Додай toSignal

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs'; // <-- Імпортуй оператори з 'rxjs'

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Components and Services
import { ExpenseCreateComponent } from '../expense-create/expense-create.component';
import { ExpenseService } from '../../../core/services/expense.service';
import { DepartmentService } from '../../../core/services/department.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { ExpenseTypeService } from '../../../core/services/expense-type.service';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    ExpenseCreateComponent,
  ],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss',
})
export class ExpenseListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private expenseService = inject(ExpenseService);
  private departmentService = inject(DepartmentService);
  private employeeService = inject(EmployeeService);
  private expenseTypeService = inject(ExpenseTypeService);

  // Data for table and filters
  expenses = this.expenseService.expenses;
  departments = this.departmentService.departments;
  employees = this.employeeService.employees;
  expenseTypes = this.expenseTypeService.expenseTypes;
  positions = this.employeeService.positions;

  displayedColumns: string[] = [
    'date',
    'amount',
    'expenseType',
    'employee',
    'position',
    'department',
  ];

  filterForm = this.fb.group({
    department: [''],
    expenseType: [''],
    employee: [''],
    position: [''],
  });

  // Create a signal that updates when the form values change
  private filtersSignal = toSignal(
    this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value), // Emit the initial value
      debounceTime(400)
    )
  );

  constructor() {
    // React to filter changes
    effect(() => {
      const filters = this.filtersSignal();
      if (filters) {
        this.loadExpenses(filters);
      }
    });
  }

  ngOnInit(): void {
    this.loadFilterData();
  }

  loadExpenses(filters: any = {}): void {
    // Clean filters from empty values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v != null && v !== '')
    );
    this.expenseService.getExpenses(cleanFilters).subscribe();
  }

  loadFilterData(): void {
    this.departmentService.getDepartments().subscribe();
    this.employeeService.getEmployees().subscribe();
    this.expenseTypeService.getExpenseTypes().subscribe();
    this.employeeService.getPositions().subscribe(); 
  }

  clearFilters(): void {
    this.filterForm.reset({ department: '', expenseType: '', employee: '', position: '' });
  }
}
