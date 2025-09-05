import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Department } from './department.service';

// Interface for data to send to server
export interface SetMonthlyLimitDto {
  department: string; // ID
  year: number;
  month: number;
  limitAmount: number;
}

// Interface for server response
export interface MonthlyLimit {
  _id: string;
  department: Department;
  year: number;
  month: number;
  limitAmount: number;
  spentAmount: number;
}

@Injectable({
  providedIn: 'root',
})
export class MonthlyLimitService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/limits';

  private limitsPrivate = signal<MonthlyLimit[]>([]);
  public readonly limits = this.limitsPrivate.asReadonly();

  getMonthlyLimits() {
    return this.http
      .get<MonthlyLimit[]>(this.apiUrl)
      .pipe(tap((data) => this.limitsPrivate.set(data)));
  }

  setMonthlyLimit(limitData: SetMonthlyLimitDto) {
    return this.http
      .post<MonthlyLimit>(this.apiUrl, limitData)
      .pipe(tap(() => this.getMonthlyLimits().subscribe()));
  }

  updateMonthlyLimit(id: string, limitAmount: number) {
    // Send only limit amount to update
    return this.http
      .patch<MonthlyLimit>(`${this.apiUrl}/${id}`, { limitAmount })
      .pipe(tap(() => this.getMonthlyLimits().subscribe()));
  }

  deleteMonthlyLimit(id: string) {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.getMonthlyLimits().subscribe()));
  }
}
