import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DepartmentService } from '../../../core/services/department.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-department-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './department-create.component.html',
  styleUrl: './department-create.component.scss'
})
export class DepartmentCreateComponent {
  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);

  departmentForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  onSubmit() {
    if (this.departmentForm.valid) {
      // Get 'name' value from form
      const { name } = this.departmentForm.getRawValue();

      this.departmentService.createDepartment(name).subscribe({
        next: (newDepartment) => {
          this.departmentForm.reset();
        },
        error: (err) => {
          console.error('Error. Cannot create department', err);
        }
      });
    }
  }
}
