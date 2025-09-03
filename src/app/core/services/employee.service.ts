import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Department } from './department.service'; // Імпортуємо, бо співробітник містить відділ

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

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/employees';

  getEmployees() {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  createEmployee(employeeData: CreateEmployeeDto) {
    return this.http.post<Employee>(this.apiUrl, employeeData);
  }
}
