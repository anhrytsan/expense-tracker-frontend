import { Component, OnInit, inject, signal } from '@angular/core';
import { Employee, EmployeeService } from '../../../core/services/employee.service';

import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';

import { EmployeeCreateComponent } from '../employee-create/employee-create.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [MatCardModule, MatListModule, CommonModule, EmployeeCreateComponent],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);

  employees = signal<Employee[]>([]);

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        // Оновлюємо сигнал отриманими даними
        this.employees.set(data);
      },
      error: (err) => {
        console.error('Помилка отримання співробітників:', err);
      },
    });
  }
}
