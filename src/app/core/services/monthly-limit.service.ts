import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

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
  department: string;
  year: number;
  month: number;
  limitAmount: number;
  spentAmount: number;
}


@Injectable({
  providedIn: 'root'
})
export class MonthlyLimitService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/limits';

  setMonthlyLimit(limitData: SetMonthlyLimitDto) {
    return this.http.post<MonthlyLimit>(this.apiUrl, limitData);
  }
}
