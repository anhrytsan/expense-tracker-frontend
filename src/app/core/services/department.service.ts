import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  getDepartments() {
    return this.http.get<Department[]>(this.apiUrl);
  }

  createDepartment(name: string) {
    return this.http.post<Department>(this.apiUrl, { name });
  }
}
