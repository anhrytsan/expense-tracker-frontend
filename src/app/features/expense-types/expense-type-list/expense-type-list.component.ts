import {
  Component,
  OnInit,
  signal,
  inject,
  computed,
  ViewChild,
  AfterViewInit,
  effect,
} from '@angular/core';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ExpenseTypeService } from '../../../core/services/expense-type.service';
import { ExpenseType } from '../../../core/services/expense.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseTypeFormComponent } from '../expense-type-form/expense-type-form.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-expense-type-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ExpenseTypeFormComponent,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './expense-type-list.component.html',
  styleUrl: './expense-type-list.component.scss',
})
export class ExpenseTypeListComponent implements OnInit, AfterViewInit {
  private expenseTypeService = inject(ExpenseTypeService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  private expenseTypes = this.expenseTypeService.expenseTypes;

  dataSource = new MatTableDataSource<ExpenseType>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  showForm = signal(false);
  selectedExpenseType = signal<ExpenseType | undefined>(undefined);

  sortDirection = signal<'asc' | 'desc'>('asc');

  directionOptions = [
    { value: 'asc', viewValue: 'В порядку зростання' },
    { value: 'desc', viewValue: 'В порядку спадання' },
  ];

  sortedExpenseTypes = computed(() => {
    const data = [...this.expenseTypes()];
    const direction = this.sortDirection();

    data.sort((a, b) => {
      // sort by limit, putting undefined limits at the end
      // If limit is undefined, treat it as -Infinity for ascending sort
      const valA = a.limit ?? -Infinity;
      const valB = b.limit ?? -Infinity;
      const comparison = valA - valB;
      return direction === 'asc' ? comparison : -comparison;
    });

    return data;
  });

  constructor() {
    effect(() => {
      this.dataSource.data = this.sortedExpenseTypes();
    });
  }

  ngOnInit(): void {
    this.expenseTypeService.getExpenseTypes().subscribe();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  displayedColumns: string[] = ['name', 'limit', 'actions'];

  onAddNew() {
    this.showForm.set(true);
    this.selectedExpenseType.set(undefined);
  }

  onEdit(expenseType: ExpenseType) {
    this.showForm.set(true);
    this.selectedExpenseType.set(expenseType);
  }

  onFormClose() {
    this.showForm.set(false);
    this.selectedExpenseType.set(undefined);
  }

  onDelete(expenseType: ExpenseType) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Підтвердження видалення',
        message: `Ви впевнені, що хочете видалити тип витрат "${expenseType.name}"?`,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(filter((result) => result === true))
      .subscribe(() => {
        this.expenseTypeService.deleteExpenseType(expenseType._id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Тип витрат успішно видалено!');
          },
          error: (err) => this.notificationService.showError(`Помилка: ${err.error.message}`),
        });
      });
  }
}
