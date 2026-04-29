import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { User, AuthResponse } from '../models/user.model';

export interface PublicRegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:5162/api/auth';

  currentUser = signal<User | null>(this.getUserFromLocalStorage());
  isAuthenticated = computed(() => !!this.currentUser());
  
  isSuperAdmin = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    const role = user.role?.toString().toLowerCase();
    return role === 'superadmin' || role === '0';
  });

  isAdmin = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    const role = user.role?.toString().toLowerCase();
    // SuperAdmin is also an Admin
    return role === 'superadmin' || role === 'admin' || role === '0' || role === '1';
  });

  login(credentials: { username: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        
        // Prevent QuotaExceededError
        const storageUser = { ...response.user };
        if (storageUser.avatarUrl && storageUser.avatarUrl.length > 100000) {
            storageUser.avatarUrl = undefined;
        }
        localStorage.setItem('user', JSON.stringify(storageUser));
        this.currentUser.set(response.user);
      })
    );
  }

  // Herkese açık kayıt — talep oluşturur
  register(data: PublicRegisterRequest) {
    return this.http.post<any>(`${this.apiUrl}/register-public`, data);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  updateProfile(user: User) {
    return this.http.put<User>(`${this.apiUrl}/profile`, user).pipe(
      tap(updatedUser => {
        // Prevent QuotaExceededError by removing large avatar from localStorage
        const storageUser = { ...updatedUser };
        if (storageUser.avatarUrl && storageUser.avatarUrl.length > 100000) {
            storageUser.avatarUrl = undefined; // Don't store large base64 in localStorage
        }
        localStorage.setItem('user', JSON.stringify(storageUser));
        this.currentUser.set(updatedUser);
      })
    );
  }

  changePassword(oldPassword: string, newPassword: string) {
    return this.http.post(`${this.apiUrl}/change-password`, { oldPassword, newPassword });
  }

  freezeAccount() {
    // UsersController içindeki freeze-account endpoint'i
    return this.http.post('http://localhost:5162/api/users/freeze-account', {});
  }

  getPendingUsers() {
    return this.http.get<User[]>(`${this.apiUrl}/pending-users`);
  }

  approveUser(userId: number) {
    return this.http.post(`${this.apiUrl}/approve/${userId}`, {});
  }

  rejectUser(userId: number) {
    return this.http.delete(`${this.apiUrl}/reject/${userId}`);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  refreshProfile() {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap(user => {
        const storageUser = { ...user };
        if (storageUser.avatarUrl && storageUser.avatarUrl.length > 100000) {
            storageUser.avatarUrl = undefined;
        }
        localStorage.setItem('user', JSON.stringify(storageUser));
        this.currentUser.set(user);
      })
    );
  }

  private getUserFromLocalStorage(): User | null {
    try {
      const userJson = localStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
      localStorage.removeItem('user');
      return null;
    }
  }
}
