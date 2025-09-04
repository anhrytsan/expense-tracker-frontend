import { Component, OnInit, inject, signal } from '@angular/core';
import { Department, DepartmentService } from '../../../core/services/department.service';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

import { DepartmentCreateComponent } from '../department-create/department-create.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [MatCardModule, MatTableModule, DepartmentCreateComponent, DatePipe],
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.scss'
})
export class DepartmentListComponent implements OnInit {
  private departmentService = inject(DepartmentService);

  departments = this.departmentService.departments;

  // Array with the names of the columns we want to display
  displayedColumns: string[] = ['name', 'numberOfEmployees', 'createdAt'];

  // Request departments initial data after component created
  ngOnInit(): void {
    // Ask service to load data on init.
    this.departmentService.getDepartments().subscribe()
  }
}
