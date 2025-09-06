import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Expense } from '../../../core/services/expense.service';

@Component({
  selector: 'app-expense-receipt',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './expense-receipt.component.html',
  styleUrls: ['./expense-receipt.component.scss'],
})
export class ExpenseReceiptComponent {
  constructor(
    public dialogRef: MatDialogRef<ExpenseReceiptComponent>,
    @Inject(MAT_DIALOG_DATA) public expense: Expense
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onPrint(): void {
    window.print();
  }
}
