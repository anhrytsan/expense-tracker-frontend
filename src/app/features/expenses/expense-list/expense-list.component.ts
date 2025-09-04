import { Component, OnInit, inject } from '@angular/core';
import { Expense, ExpenseService } from '../../../core/services/expense.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { CommonModule, DatePipe } from '@angular/common';
import { ExpenseCreateComponent } from '../expense-create/expense-create.component';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [MatCardModule, MatListModule, CommonModule, DatePipe, ExpenseCreateComponent],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss'
})
export class ExpenseListComponent implements OnInit {
  private expenseService = inject(ExpenseService);

  expenses = this.expenseService.expenses;

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.expenseService.getExpenses().subscribe();
  }
}
