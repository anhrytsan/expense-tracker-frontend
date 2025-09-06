// front/src/app/features/expenses/expense-list/expense-list.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

// Components and Services
import { ExpenseCreateComponent } from '../expense-create/expense-create.component';
import { Expense, ExpenseService } from '../../../core/services/expense.service';
import { DepartmentService } from '../../../core/services/department.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { ExpenseTypeService } from '../../../core/services/expense-type.service';
import { ExpenseReceiptComponent } from '../../../shared/components/expense-receipt/expense-receipt.component';

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
    MatPaginatorModule,
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
  private dialog = inject(MatDialog); // Інжектуємо MatDialog

  // Data signals
  expenses = this.expenseService.expenses;
  totalExpenses = this.expenseService.totalExpenses;
  departments = this.departmentService.departments;
  employees = this.employeeService.allEmployees;
  expenseTypes = this.expenseTypeService.expenseTypes;
  positions = this.employeeService.positions;

  // Pagination signals
  pageSize = signal(10);
  pageIndex = signal(0);

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

  ngOnInit(): void {
    this.loadFilterData();
    this.loadExpenses();

    this.filterForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe(() => {
        this.pageIndex.set(0);
        this.loadExpenses();
      });
  }

  loadExpenses(): void {
    const filters = this.filterForm.value;
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v != null && v !== '')
    );

    const params = {
      ...cleanFilters,
      page: this.pageIndex() + 1,
      limit: this.pageSize(),
    };

    this.expenseService.getExpenses(params).subscribe();
  }

  loadFilterData(): void {
    this.departmentService.getDepartments().subscribe();
    this.employeeService.loadAllEmployeesForForms();
    this.expenseTypeService.getExpenseTypes().subscribe();
    this.employeeService.getPositions().subscribe();
  }

  clearFilters(): void {
    this.filterForm.reset({ department: '', expenseType: '', employee: '', position: '' });
  }

  handlePageEvent(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadExpenses();
  }

  // Новий метод для відкриття чека
  openReceipt(expense: Expense): void {
    this.dialog.open(ExpenseReceiptComponent, {
      width: '500px',
      data: expense,
      panelClass: 'receipt-dialog-container',
    });
  }
}
