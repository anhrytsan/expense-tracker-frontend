import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
   private snackBar = inject(MatSnackBar);

  // For success notifications
  showSuccess(message: string): void {
    this.snackBar.open(message, 'Закрити', {
      duration: 3000,
      panelClass: ['snackbar-success'],
    });
  }

  // For errors
  showError(message: string): void {
    this.snackBar.open(message, 'Закрити', {
      duration: 5000,
      panelClass: ['snackbar-error'],
    });
  }
}
