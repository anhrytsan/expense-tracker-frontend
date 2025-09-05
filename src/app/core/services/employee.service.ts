import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Department } from './department.service';
import { tap } from 'rxjs';

export interface Employee {
  _id: string;
  name: string;
  position: string;
  department: Department;
  updatedAt: string;
}

// Interface for data that we send
export interface CreateEmployeeDto {
  name: string;
  position: string;
  department: string; // We send only department ID when creating
}

// --- NEW --- Interface for updating
export interface UpdateEmployeeDto {
  name?: string;
  position?: string;
  department?: string;
}


@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/employees';

  private employeesPrivate = signal<Employee[]>([]);
  public readonly employees = this.employeesPrivate.asReadonly();

  private positionsPrivate = signal<string[]>([]);
  public readonly positions = this.positionsPrivate.asReadonly();

  getEmployees() {
    return this.http.get<Employee[]>(this.apiUrl).pipe(
      tap(data => this.employeesPrivate.set(data))
    );
  }

  createEmployee(employeeData: CreateEmployeeDto) {
    return this.http.post<Employee>(this.apiUrl, employeeData).pipe(
      tap(() => this.getEmployees().subscribe())
    );
  }

  // --- NEW METHOD ---
  updateEmployee(id: string, employeeData: UpdateEmployeeDto) {
    return this.http.patch<Employee>(`${this.apiUrl}/${id}`, employeeData).pipe(
      tap(() => this.getEmployees().subscribe())
    );
  }

  // --- NEW METHOD ---
  deleteEmployee(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.getEmployees().subscribe())
    );
  }

  getPositions() {
    return this.http.get<string[]>(`${this.apiUrl}/positions`).pipe(
      tap(data => this.positionsPrivate.set(data))
    );
  }
}
