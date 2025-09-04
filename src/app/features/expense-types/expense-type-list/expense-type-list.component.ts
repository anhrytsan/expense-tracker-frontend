import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseTypeService } from '../../../core/services/expense-type.service';
import { ExpenseType } from '../../../core/services/expense.service';

import { ExpenseTypeFormComponent } from '../expense-type-form/expense-type-form.component';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-expense-type-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ExpenseTypeFormComponent
  ],
  templateUrl: './expense-type-list.component.html',
  styleUrl: './expense-type-list.component.scss'
})
export class ExpenseTypeListComponent {
  private expenseTypeService = inject(ExpenseTypeService);

  expenseTypes = this.expenseTypeService.expenseTypes;

  // Signals for state management
  showForm = signal(false);
  selectedExpenseType = signal<ExpenseType | undefined>(undefined);

  displayedColumns: string[] = ['name', 'limit', 'actions'];

  ngOnInit(): void {
    this.expenseTypeService.getExpenseTypes().subscribe();
  }

  onAddNew() {
    this.showForm.set(true);
    this.selectedExpenseType.set(undefined);
  }

  onEdit(expenseType: ExpenseType) {
    this.showForm.set(true);
    this.selectedExpenseType.set(expenseType); // Data for editing
  }

  onFormClose() {
    this.showForm.set(false);
    this.selectedExpenseType.set(undefined);
  }

  deleteExpenseType(id: string) {
    if (confirm('Ви впевнені, що хочете видалити цей тип витрат?')) {
      this.expenseTypeService.deleteExpenseType(id).subscribe({
        next: () => console.log('Тип витрат успішно видалено'),
        error: (err) => console.error('Помилка видалення:', err)
      });
    }
  }
}
