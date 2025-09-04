import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

import { DepartmentService } from '../../../core/services/department.service';
import { MonthlyLimitService } from '../../../core/services/monthly-limit.service';

@Component({
  selector: 'app-monthly-limit-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule
  ],
  templateUrl: './monthly-limit-form.component.html',
  styleUrl: './monthly-limit-form.component.scss'
})
export class MonthlyLimitFormComponent {
  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);
  private monthlyLimitService = inject(MonthlyLimitService);

  departments = this.departmentService.departments;

  limitForm = this.fb.nonNullable.group({
    department: ['', Validators.required],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(2020)]],
    month: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
    limitAmount: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    // Load department list on init
    this.departmentService.getDepartments().subscribe();
  }

  onSubmit() {
    if (this.limitForm.valid) {
      this.monthlyLimitService.setMonthlyLimit(this.limitForm.getRawValue()).subscribe({
        next: (response) => {
          console.log('Limit succesfully set:', response);
          alert('Limit successfully set');
          this.limitForm.reset({
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            limitAmount: 0
          });
        },
        error: (err) => {
          console.error('Error. Cannot set limit:', err);
          alert(`Error: ${err.error.message}`);
        }
      });
    }
  }
}
