import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {

  profileName = 'Sethulakshmi';
  profileEmail = '';
  clinicName = 'MediBook';
  clinicPhone = '';
  clinicEmail = '';

  appointmentNotifications = true;
  emailNotifications = true;

  saved = false;

  constructor(private router: Router) {}

  saveSettings(): void {

    this.saved = true;

    setTimeout(() => {
      this.saved = false;
    }, 3000);

  }

  goToDashboard(): void {
    this.router.navigate(['/']);
  }

}