import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Department } from './department.service';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

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

export interface PaginatedEmployees {
  docs: Employee[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/employees`;

  // Сигнал для пагінованого списку (використовується в EmployeeListComponent)
  private employeesPrivate = signal<Employee[]>([]);
  public readonly employees = this.employeesPrivate.asReadonly();

  // --- НОВИЙ СИГНАЛ --- для повного списку (для форм)
  private allEmployeesPrivate = signal<Employee[]>([]);
  public readonly allEmployees = this.allEmployeesPrivate.asReadonly();

  private totalEmployeesPrivate = signal(0);
  public readonly totalEmployees = this.totalEmployeesPrivate.asReadonly();

  private positionsPrivate = signal<string[]>([]);
  public readonly positions = this.positionsPrivate.asReadonly();

  // Цей метод залишається для пагінації
  getEmployees(filters: any = {}) {
    const params = new HttpParams({ fromObject: filters });

    return this.http.get<PaginatedEmployees>(this.apiUrl, { params }).pipe(
      tap((data) => {
        this.employeesPrivate.set(data.docs);
        this.totalEmployeesPrivate.set(data.totalDocs);
      })
    );
  }

  // --- НОВИЙ МЕТОД --- для завантаження всіх співробітників
  loadAllEmployeesForForms() {
    // Якщо дані вже завантажені, не робимо повторний запит
    if (this.allEmployeesPrivate().length > 0) {
      return;
    }
    const params = new HttpParams({ fromObject: { limit: '0' } });
    this.http.get<PaginatedEmployees>(this.apiUrl, { params }).subscribe((data) => {
      this.allEmployeesPrivate.set(data.docs);
    });
  }

  createEmployee(employeeData: CreateEmployeeDto) {
    return this.http.post<Employee>(this.apiUrl, employeeData).pipe(
      tap(() => {
        this.getEmployees().subscribe();
        // Оновлюємо і повний список
        this.allEmployeesPrivate.set([]); // Скидаємо, щоб перезавантажити
        this.loadAllEmployeesForForms();
      })
    );
  }

  updateEmployee(id: string, employeeData: UpdateEmployeeDto) {
    return this.http.patch<Employee>(`${this.apiUrl}/${id}`, employeeData).pipe(
      tap(() => {
        this.getEmployees().subscribe();
        this.allEmployeesPrivate.set([]);
        this.loadAllEmployeesForForms();
      })
    );
  }

  deleteEmployee(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.getEmployees().subscribe();
        this.allEmployeesPrivate.set([]);
        this.loadAllEmployeesForForms();
      })
    );
  }

  getPositions() {
    return this.http
      .get<string[]>(`${this.apiUrl}/positions`)
      .pipe(tap((data) => this.positionsPrivate.set(data)));
  }
}
