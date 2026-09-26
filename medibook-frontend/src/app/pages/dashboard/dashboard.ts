import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { DoctorService } from '../../service/doctor';
import { Patients } from '../../service/patients';
import { Appoinments as AppointmentService } from '../../service/appoinments';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private doctorService = inject(DoctorService);
  private patientService = inject(Patients);
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);

  // Dashboard summary values
  totalDoctors = 0;
  totalPatients = 0;
  totalAppointments = 0;
  pendingAppointments = 0;

  // Upcoming appointments
  upcomingAppointments: any[] = [];

  // Loading and error status
  isLoading = true;
  hasError = false;


  // Component initialization
  ngOnInit(): void {
    this.loadDashboardData();
  }


  // Load data from all APIs
  loadDashboardData(): void {

    this.isLoading = true;
    this.hasError = false;


    // -----------------------------
    // Doctors API
    // -----------------------------
    this.doctorService.getDoctors().subscribe({

      next: (doctors) => {

        console.log('Doctors API response:', doctors);

        this.totalDoctors = doctors.length;

        console.log('Total doctors:', this.totalDoctors);

      },

      error: (error) => {

        console.error('Doctors API error:', error);

        this.hasError = true;

      }

    });


    // -----------------------------
    // Patients API
    // -----------------------------
    this.patientService.getPatients().subscribe({

      next: (patients) => {

        console.log('Patients API response:', patients);

        this.totalPatients = patients.length;

        console.log('Total patients:', this.totalPatients);

      },

      error: (error) => {

        console.error('Patients API error:', error);

        this.hasError = true;

      }

    });


    // -----------------------------
    // Appointments API
    // -----------------------------
    this.appointmentService.getAppoinments().subscribe({

      next: (appointments) => {

        console.log(
          'Appointments API response:',
          appointments
        );

        // Total appointments count
        this.totalAppointments = appointments.length;


        // Scheduled appointments count
        this.pendingAppointments = appointments.filter(
          (appointment) =>
            appointment.status?.toLowerCase() === 'scheduled'
        ).length;


        // Upcoming scheduled appointments
        this.upcomingAppointments = appointments
          .filter(
            (appointment) =>
              appointment.status?.toLowerCase() === 'scheduled'
          )
          .sort(
            (a, b) =>
              new Date(a.appointmentDate).getTime() -
              new Date(b.appointmentDate).getTime()
          )
          .slice(0, 5);


        console.log(
          'Total appointments:',
          this.totalAppointments
        );

        console.log(
          'Scheduled appointments:',
          this.pendingAppointments
        );

        console.log(
          'Upcoming appointments:',
          this.upcomingAppointments
        );

      },

      error: (error) => {

        console.error('Appointments API error:', error);

        this.hasError = true;

      }

    });


    // Allow dashboard content to display
    this.isLoading = false;

  }


  // Format appointment date
  getAppointmentDate(date: string): string {

    if (!date) {
      return 'Date not available';
    }

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );

  }


  // Get patient initials
  getPatientInitials(name: string): string {

    if (!name) {
      return 'P';
    }

    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();

  }


  // Navigate to Dashboard
  goToDashboard(): void {

    this.router.navigate(['/']);

  }


  // Navigate to Doctors page
  goToDoctors(): void {

    this.router.navigate(['/doctors']);

  }


  // Navigate to Patients page
  goToPatients(): void {

    this.router.navigate(['/patients']);

  }


  // Navigate to Appointments page
  goToAppointments(): void {

    this.router.navigate(['/appointments']);

  }

}