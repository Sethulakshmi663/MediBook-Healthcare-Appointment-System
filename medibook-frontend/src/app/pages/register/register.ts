
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { Auth, RegisterRequest } from '../../service/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  name = '';
  email = '';
  password = '';
  age: number | null = null;
  gender = '';
  phone = '';
  address = '';

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  onRegister() {

    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.age ||
      !this.gender ||
      !this.phone.trim()
    ) {
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must contain at least 6 characters.';
      return;
    }

    const registerData: RegisterRequest = {
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password,
      age: Number(this.age),
      gender: this.gender,
      phone: this.phone.trim(),
      address: this.address.trim()
    };

    this.isLoading = true;

    this.auth.register(registerData)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({

        next: (response) => {
          this.successMessage = response.message;

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },

        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Registration failed. Please try again.';
        }

      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
