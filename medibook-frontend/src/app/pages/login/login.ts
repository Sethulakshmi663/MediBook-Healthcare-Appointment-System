
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth, LoginRequest } from '../../service/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';

  errorMessage = '';
  isLoading = false;

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  onLogin() {

    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    const loginData: LoginRequest = {
      email: this.email,
      password: this.password
    };

    this.isLoading = true;

    this.auth.login(loginData).subscribe({
      next: (response) => {

        localStorage.setItem('token', response.token);
        localStorage.setItem('name', response.name);
        localStorage.setItem('email', response.email);
        localStorage.setItem('role', response.role);

        this.isLoading = false;

        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        this.isLoading = false;

        this.errorMessage =
          error.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}
