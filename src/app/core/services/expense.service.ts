import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Department } from './department.service';
import { Employee } from './employee.service';
import { tap } from 'rxjs';

export interface ExpenseType {
  _id: string;
  name: string;
  description?: string;
  limit: number;
}

export interface Expense {
  _id: string;
  amount: number;
  date: string;
  expenseType: ExpenseType | null;
  employee: Employee | null;
  department: Department | null;
}

// Interface for creating new expense (DTO - Data Transfer Object)
// We send only ID, not objects
export interface CreateExpenseDto {
  amount: number;
  date: string;
  expenseType: string; // ID
  employee: string; // ID
  department: string; // ID
}

export interface PaginatedExpenses {
  docs: Expense[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
}

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/expenses';

  private expensesPrivate = signal<Expense[]>([]);
  public readonly expenses = this.expensesPrivate.asReadonly();
  private totalExpensesPrivate = signal(0);
  public readonly totalExpenses = this.totalExpensesPrivate.asReadonly();

  getExpenses(filters: any = {}) {
    const params = new HttpParams({ fromObject: filters });

    return this.http
      .get<PaginatedExpenses>(this.apiUrl, { params })
      .pipe(tap((data) => {
        this.expensesPrivate.set(data.docs);
        this.totalExpensesPrivate.set(data.totalDocs);
      }));
  }

  createExpense(expenseData: CreateExpenseDto) {
    return this.http.post<Expense>(this.apiUrl, expenseData).pipe(
      tap(() => this.getExpenses().subscribe()) // Автоматично оновлюємо список
    );
  }
}
