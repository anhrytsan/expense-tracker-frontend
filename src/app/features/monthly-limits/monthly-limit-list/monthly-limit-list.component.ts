import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
  AfterViewInit,
  ViewChild,
  effect,
} from '@angular/core';
import { filter } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import {
  MonthlyLimit,
  MonthlyLimitService,
} from '../../../core/services/monthly-limit.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DepartmentService } from '../../../core/services/department.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MonthlyLimitFormComponent } from '../monthly-limit-form/monthly-limit-form.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

type SortableField = keyof MonthlyLimit | 'carryover' | 'effectiveLimit' | 'available' | 'period';

@Component({
  selector: 'app-monthly-limit-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MonthlyLimitFormComponent,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    DatePipe,
  ],
  templateUrl: './monthly-limit-list.component.html',
  styleUrl: './monthly-limit-list.component.scss',
})
export class MonthlyLimitListComponent implements OnInit, AfterViewInit {
  private monthlyLimitService = inject(MonthlyLimitService);
  private notificationService = inject(NotificationService);
  private departmentService = inject(DepartmentService);
  private dialog = inject(MatDialog);

  private limits = this.monthlyLimitService.limits;
  private departments = this.departmentService.departments;

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  showForm = signal(false);
  selectedLimit = signal<MonthlyLimit | undefined>(undefined);

  sortBy = signal<SortableField>('period');
  sortDirection = signal<'asc' | 'desc'>('desc');

  sortOptions: { value: SortableField; viewValue: string }[] = [
    { value: 'period', viewValue: 'Період' },
    { value: 'limitAmount', viewValue: 'Ліміт' },
    { value: 'spentAmount', viewValue: 'Витрачено' },
    { value: 'carryover', viewValue: 'Залишок з минулих місяців' },
    { value: 'effectiveLimit', viewValue: 'Ефективний ліміт' },
    { value: 'available', viewValue: 'Доступно' },
  ];

  directionOptions = computed(() => {
    if (this.sortBy() === 'period') {
      return [
        { value: 'desc', viewValue: 'Спочатку новіші' },
        { value: 'asc', viewValue: 'Спочатку старіші' },
      ];
    }
    return [
      { value: 'asc', viewValue: 'В порядку зростання' },
      { value: 'desc', viewValue: 'В порядку спадання' },
    ];
  });

  limitsWithData = computed(() => {
    const limits = this.limits();
    const departments = this.departments();
    if (!departments.length) {
      return [];
    }
    return limits.map((limit) => {
      const departmentData = departments.find((d) => d._id === limit.department?._id);
      return {
        ...limit,
        carryover: departmentData?.carryover,
        effectiveLimit: departmentData?.effectiveLimit,
        available: departmentData?.available,
        // Створюємо поле для сортування по періоду
        periodSort: new Date(limit.year, limit.month - 1).getTime()
      };
    });
  });

  sortedLimits = computed(() => {
    const data = [...this.limitsWithData()];
    const key = this.sortBy();
    const direction = this.sortDirection();

    if (key === 'period' && !['asc', 'desc'].includes(direction)) {
      this.sortDirection.set('desc');
    }

    data.sort((a, b) => {
      const valA = key === 'period' ? a.periodSort : a[key as keyof MonthlyLimit] ?? 0;
      const valB = key === 'period' ? b.periodSort : b[key as keyof MonthlyLimit] ?? 0;

      let comparison = 0;

      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return data;
  });

  constructor() {
    effect(() => {
      this.dataSource.data = this.sortedLimits();
    });
  }

  ngOnInit(): void {
    this.monthlyLimitService.getMonthlyLimits().subscribe();
    this.departmentService.getDepartments().subscribe();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  displayedColumns: string[] = [
    'department',
    'period',
    'limitAmount',
    'carryover',
    'effectiveLimit',
    'spentAmount',
    'available',
    'actions',
  ];

  onAddNew() {
    this.showForm.set(true);
    this.selectedLimit.set(undefined);
  }

  onEdit(limit: MonthlyLimit) {
    this.showForm.set(true);
    this.selectedLimit.set(limit);
  }

  onFormClose() {
    this.showForm.set(false);
    this.selectedLimit.set(undefined);
  }

  onDelete(limit: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Підтвердження видалення',
        message: `Ви впевнені, що хочете видалити ліміт для відділу "${limit.department.name}" за ${limit.month}/${limit.year}?`,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(filter((result) => result === true))
      .subscribe(() => {
        this.monthlyLimitService.deleteMonthlyLimit(limit._id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Ліміт успішно видалено!');
          },
          error: (err) => this.notificationService.showError(`Помилка: ${err.error.message}`),
        });
      });
  }
}
