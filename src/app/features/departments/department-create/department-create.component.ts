import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DepartmentService } from '../../../core/services/department.service';
import { NotificationService } from '../../../core/services/notification.service'; // <-- Додай це


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
  private notificationService = inject(NotificationService);

  // @Output() departmentCreated = new EventEmitter<void>();


  departmentForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  onSubmit() {
    if (this.departmentForm.valid) {
      // Get 'name' value from form
      const { name } = this.departmentForm.getRawValue();

      this.departmentService.createDepartment(name).subscribe({
        next: (newDepartment) => {
          this.notificationService.showSuccess(`Відділ "${name}" успішно створено!`);
          this.departmentForm.reset();
          // this.departmentCreated.emit(); // Повідомляємо батьківський компонент
        },
        error: (err) => {
          console.error('Error. Cannot create department', err);
          this.notificationService.showError(`Помилка створення відділу: ${err.error.message}`);
        },
      });
    }
  }
}
