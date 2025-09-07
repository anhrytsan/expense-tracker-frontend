import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';

import { DashboardLayoutComponent } from './features/dashboard/dashboard-layout/dashboard-layout.component';
import { ExpenseListComponent } from './features/expenses/expense-list/expense-list.component';
import { DepartmentListComponent } from './features/departments/department-list/department-list.component';
import { EmployeeListComponent } from './features/employees/employee-list/employee-list.component';
import { ExpenseTypeListComponent } from './features/expense-types/expense-type-list/expense-type-list.component';
import { MonthlyLimitFormComponent } from './features/monthly-limits/monthly-limit-form/monthly-limit-form.component';
import { MonthlyLimitListComponent } from './features/monthly-limits/monthly-limit-list/monthly-limit-list.component';
import { RegisterComponent } from './features/auth/register/register.component';



export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [publicGuard],
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: DashboardComponent },
      { path: 'expenses', component: ExpenseListComponent },
      { path: 'departments', component: DepartmentListComponent },
      { path: 'employees', component: EmployeeListComponent },
      { path: 'expense-types', component: ExpenseTypeListComponent },
      { path: 'limits', component: MonthlyLimitListComponent },
    ],
  },
  // Redirect to dashboard if route doesn't exist
  { path: '**', redirectTo: 'dashboard' }
];
