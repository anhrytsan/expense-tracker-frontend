import { Component, OnInit, inject, signal } from '@angular/core';
import { Employee, EmployeeService } from '../../../core/services/employee.service';

import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

import { EmployeeCreateComponent } from '../employee-create/employee-create.component';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [MatCardModule, MatTableModule, CommonModule, EmployeeCreateComponent],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);

  employees = this.employeeService.employees;

  displayedColumns: string[] = ['name', 'position', 'department'];

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe();
  }
}
