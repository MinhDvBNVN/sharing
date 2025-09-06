import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError, of, delay } from 'rxjs';
import { MockDataService } from '../services/mock-data.service';

export interface User {
  id: string;
  username: string;
  email: string;
  department: string;
  role: 'admin' | 'user';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);
  
  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  
  private mockDataService = inject(MockDataService);
  
  constructor() {
    this.loadTokenFromStorage();
    // Auto-login with mock user for demo purposes
    if (!this.isAuthenticated()) {
      this.autoLoginMockUser();
    }
  }
  
  private autoLoginMockUser(): void {
    const mockUser = this.mockDataService.getMockUser();
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    setTimeout(() => {
      this.setAuthData(mockToken, mockUser);
    }, 1000);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Mock login for demo - accept any credentials
    const mockUser = this.mockDataService.getMockUser();
    const mockResponse: LoginResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      user: mockUser,
      expiresIn: 3600 // 1 hour
    };
    
    return of(mockResponse).pipe(
      delay(800), // Simulate network delay
      tap(response => {
        this.setAuthData(response.token, response.user);
        this.scheduleTokenRefresh(response.expiresIn);
      })
    );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private setAuthData(token: string, user: User): void {
    this.tokenSignal.set(token);
    this.currentUserSignal.set(user);
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  private clearAuthData(): void {
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
  }

  private loadTokenFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('currentUser');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.tokenSignal.set(token);
        this.currentUserSignal.set(user);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuthData();
      }
    }
  }

  private scheduleTokenRefresh(expiresIn: number): void {
    const refreshTime = (expiresIn - 300) * 1000; // Refresh 5 minutes before expiry
    setTimeout(() => {
      this.refreshToken();
    }, refreshTime);
  }

  private refreshToken(): void {
    this.http.post<LoginResponse>('/api/auth/refresh', {}).subscribe({
      next: (response) => {
        this.setAuthData(response.token, response.user);
        this.scheduleTokenRefresh(response.expiresIn);
      },
      error: () => {
        this.logout();
      }
    });
  }
}