import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { ExpenseType } from './expense.service';

// Interface for creating/updating
export interface CreateExpenseTypeDto {
  name: string;
  description?: string;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseTypeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/expense-types';

  // Signal for storing expense types
  private expenseTypesPrivate = signal<ExpenseType[]>([]);
  // Make signal readonly for external classes
  public readonly expenseTypes = this.expenseTypesPrivate.asReadonly();

  getExpenseTypes() {
    return this.http.get<ExpenseType[]>(this.apiUrl).pipe(
      // Update signal on every data get
      tap(data => this.expenseTypesPrivate.set(data))
    );
  }

  createExpenseType(data: CreateExpenseTypeDto) {
    return this.http.post<ExpenseType>(this.apiUrl, data).pipe(
      tap(() => this.getExpenseTypes().subscribe()) // Оновлюємо список
    );
  }

  updateExpenseType(id: string, data: Partial<CreateExpenseTypeDto>) {
    return this.http.patch<ExpenseType>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.getExpenseTypes().subscribe())
    );
  }

  deleteExpenseType(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.getExpenseTypes().subscribe())
    );
  }
}
