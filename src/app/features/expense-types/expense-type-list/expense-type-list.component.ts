import { Component, inject, signal } from '@angular/core';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ExpenseTypeService } from '../../../core/services/expense-type.service';
import { ExpenseType } from '../../../core/services/expense.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

import { ExpenseTypeFormComponent } from '../expense-type-form/expense-type-form.component';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-expense-type-list',
  standalone: true,
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
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog); // Інжектуємо сервіс діалогів

  expenseTypes = this.expenseTypeService.expenseTypes;

  showForm = signal(false);
  selectedExpenseType = signal<ExpenseType | undefined>(undefined);

  displayedColumns: string[] = ['name', 'limit', 'actions'];

  ngOnInit(): void {
    this.expenseTypeService.getExpenseTypes().subscribe();
  }

  // ... методи onAddNew, onEdit, onFormClose без змін ...
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

  // --- ОНОВЛЕНИЙ МЕТОД deleteExpenseType ---
  deleteExpenseType(id: string, name: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Підтвердження видалення',
        message: `Ви впевнені, що хочете видалити тип витрат "${name}"?`,
      },
    });

    dialogRef.afterClosed()
      .pipe(filter(result => result === true))
      .subscribe(() => {
        this.expenseTypeService.deleteExpenseType(id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Тип витрат успішно видалено');
          },
          error: (err) => {
            this.notificationService.showError(`Помилка видалення: ${err.error.message}`);
          }
        });
      });
  }
}
