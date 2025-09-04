import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

// Move later to shared/models
export interface Department {
  _id: string,
  name: string;
  numberOfEmployees: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/departments';

  // Single source of truth for DepartmentListComponent and EmployeeCreateComponent
  private departmentsPrivate = signal<Department[]>([]);
  public readonly departments = this.departmentsPrivate.asReadonly();


  getDepartments() {
    return this.http.get<Department[]>(this.apiUrl).pipe(
      // Update department list after getting data
      tap(data => this.departmentsPrivate.set(data))
    );
  }

  createDepartment(name: string) {
    return this.http.post<Department>(this.apiUrl, { name }).pipe(
      // Update department list after creating
      tap(() => this.getDepartments().subscribe())
    );
  }

  updateDepartment(id: string, name: string) {
    return this.http.patch<Department>(`${this.apiUrl}/${id}`, { name }).pipe(
      tap(() => this.getDepartments().subscribe())
    );
  }

  deleteDepartment(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.getDepartments().subscribe())
    );
  }
}
