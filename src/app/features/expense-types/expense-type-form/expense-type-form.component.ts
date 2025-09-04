import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateExpenseTypeDto, ExpenseTypeService } from '../../../core/services/expense-type.service';
import { ExpenseType } from '../../../core/services/expense.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NotificationService } from '../../../core/services/notification.service';


@Component({
  selector: 'app-expense-type-form',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule],
  templateUrl: './expense-type-form.component.html',
  styleUrl: './expense-type-form.component.scss'
})
export class ExpenseTypeFormComponent {
  private fb = inject(FormBuilder);
  private expenseTypeService = inject(ExpenseTypeService);
  private notificationService = inject(NotificationService); // <-- Додай це


  // Input data: якщо передаємо існуючий тип, форма буде в режимі редагування
  @Input() expenseType?: ExpenseType;
  // Event that notifies parent that form is closed
  @Output() formClose = new EventEmitter<void>();

  expenseTypeForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    limit: [0, [Validators.required, Validators.min(0)]]
  });

  isEditMode = false;

  ngOnInit(): void {
    // If input data - it's edit mode
    if (this.expenseType) {
      this.isEditMode = true;
      // Fill form with existing data
      this.expenseTypeForm.patchValue(this.expenseType);
    }
  }

  onSubmit() {
    if (this.expenseTypeForm.invalid) {
      return;
    }

    const formData = this.expenseTypeForm.getRawValue() as CreateExpenseTypeDto;

    if (this.isEditMode && this.expenseType) {
      // Updating existing type
      this.expenseTypeService.updateExpenseType(this.expenseType._id, formData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Тип витрат успішно оновлено!');
          this.formClose.emit();
        },
        error: (err) => this.notificationService.showError(`Помилка: ${err.error.message}`),
      });
    } else {
      // Creating new
      this.expenseTypeService.createExpenseType(formData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Новий тип витрат створено!');
          this.formClose.emit();
        },
        error: (err) => this.notificationService.showError(`Помилка: ${err.error.message}`),
      });
    }
  }

  cancel() {
    this.formClose.emit();
  }
}
