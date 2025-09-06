import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { Department } from './department.service';
import { Expense } from './expense.service';
import { environment } from '../../../environments/environment';

export interface DepartmentLimit {
  _id: string;
  department: Department;
  limitAmount: number;
  spentAmount: number;
  year: number;
  month: number;
}

export interface DashboardSummary {
  summary: {
    totalLimit: number;
    totalSpent: number;
  };
  byDepartment: DepartmentLimit[];
  recentExpenses: Expense[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/dashboard`;

  private summaryPrivate = signal<DashboardSummary | null>(null);
  public readonly summary = this.summaryPrivate.asReadonly();

  getSummary() {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/summary`).pipe(
      tap((data) => this.summaryPrivate.set(data)) // Оновлюємо сигнал
    );
  }
}
