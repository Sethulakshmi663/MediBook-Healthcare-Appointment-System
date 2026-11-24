
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Login response from backend
export interface LoginResponse {
  message: string;
  token: string;
  name: string;
  email: string;
  role: string;
}

// Registration request
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  age: number;
  gender: string;
  phone: string;
  address?: string;
}

// Registration response from backend
export interface RegisterResponse {
  message: string;
  patientId: number;
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:7056/api/Auth';

  // Login
  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      data
    );
  }

  // Register
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register`,
      data
    );
  }

  logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('name');
  localStorage.removeItem('email');
  localStorage.removeItem('role');
}
}
