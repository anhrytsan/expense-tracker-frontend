import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

// Move later to shared/models

interface AuthResponse {
  token: string;
  user: {
    email: string;
  };
}

interface RegisterResponse {
  user: {
    email: string;
    createdAt: string;
  }
}

interface UserCredentials {
  email: string;
  password?: string; // password is not always neccesary, e.g. getting user info
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/api/auth`;

  // Signal with registered user data
  currentUser = signal<UserCredentials | null>(null);

  register(credentials: UserCredentials) {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, credentials);
  }

  login(credentials: UserCredentials) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      // Check data stream without modifying
      tap((response) => {
        // Get token and save it in localStorage
        localStorage.setItem('auth_token', response.token);

        // Update signal with new user data
        this.currentUser.set(response.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('auth_token');

    this.currentUser.set(null);
  }
}
