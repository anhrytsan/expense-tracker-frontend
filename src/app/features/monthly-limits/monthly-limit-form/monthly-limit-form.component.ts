import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core'; // Додай Input, Output, EventEmitter
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

import { DepartmentService } from '../../../core/services/department.service';
import { MonthlyLimit, MonthlyLimitService, SetMonthlyLimitDto } from '../../../core/services/monthly-limit.service'; // Додай MonthlyLimit
import { NotificationService } from '../../../core/services/notification.service'

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
export class MonthlyLimitFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);
  private monthlyLimitService = inject(MonthlyLimitService);
  private notificationService = inject(NotificationService);

  @Input() limit?: MonthlyLimit; // Input data for editing
  @Output() formClose = new EventEmitter<void>(); // Event for form closing
  isEditMode = false;

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

    if (this.limit) {
      this.isEditMode = true;
      this.limitForm.patchValue({
        department: this.limit.department._id,
        year: this.limit.year,
        month: this.limit.month,
        limitAmount: this.limit.limitAmount
      });
      // Block uneditable fields
      this.limitForm.controls.department.disable();
      this.limitForm.controls.year.disable();
      this.limitForm.controls.month.disable();
    }
  }

   onSubmit() {
    if (this.limitForm.invalid) {
      return;
    }

    if (this.isEditMode && this.limit) {
      // Update existing limit
      const { limitAmount } = this.limitForm.getRawValue();
      this.monthlyLimitService.updateMonthlyLimit(this.limit._id, limitAmount).subscribe({
        next: () => {
          this.notificationService.showSuccess('Ліміт успішно оновлено!');
          this.formClose.emit();
        },
        error: (err) => this.notificationService.showError(`Помилка: ${err.error.message}`),
      });
    } else {
      // Create new limit
      const formData = this.limitForm.getRawValue() as SetMonthlyLimitDto;
      this.monthlyLimitService.setMonthlyLimit(formData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Ліміт успішно встановлено');
          this.formClose.emit();
        },
        error: (err) => {
          this.notificationService.showError(`Помилка: ${err.error.message}`);
        }
      });
    }
  }

  cancel() {
    this.formClose.emit();
  }
}
