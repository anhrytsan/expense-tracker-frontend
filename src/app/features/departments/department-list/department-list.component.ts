import { Component, OnInit, inject, signal } from '@angular/core';
import { Department, DepartmentService } from '../../../core/services/department.service';

import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

import { DepartmentCreateComponent } from '../department-create/department-create.component';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [MatCardModule, MatListModule, CommonModule, DepartmentCreateComponent],
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.scss'
})
export class DepartmentListComponent implements OnInit {
  private departmentService = inject(DepartmentService);

  departments = this.departmentService.departments;

  // Request departments initial data after component created
  ngOnInit(): void {
    // Ask service to load data on init.
    this.departmentService.getDepartments().subscribe()
  }
}
