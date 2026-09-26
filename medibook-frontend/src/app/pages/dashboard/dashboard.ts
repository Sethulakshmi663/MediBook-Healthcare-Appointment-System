import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

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
  private cdr = inject(ChangeDetectorRef);

  // Dashboard values
  totalDoctors = 0;
  totalPatients = 0;
  totalAppointments = 0;
  pendingAppointments = 0;

  // Upcoming appointments
  upcomingAppointments: any[] = [];

  // Loading and error
  isLoading = true;
  hasError = false;


  // -----------------------------------
  // Component initialization
  // -----------------------------------

  ngOnInit(): void {

    console.log('Dashboard started');

    this.loadDashboardData();

  }


  // -----------------------------------
  // Load dashboard data
  // -----------------------------------

  loadDashboardData(): void {

    this.isLoading = true;
    this.hasError = false;


    // -----------------------------------
    // Get Doctors
    // -----------------------------------

    this.doctorService.getDoctors().subscribe({

      next: (doctors) => {

        console.log('Doctors received:', doctors);

        this.totalDoctors = doctors.length;

        console.log(
          'Total Doctors:',
          this.totalDoctors
        );

        this.cdr.detectChanges();

        this.isLoading = false;

      },

      error: (error) => {

        console.error(
          'Doctors API Error:',
          error
        );

        this.hasError = true;
        this.isLoading = false;

        this.cdr.detectChanges();

      }

    });


    // -----------------------------------
    // Get Patients
    // -----------------------------------

    this.patientService.getPatients().subscribe({

      next: (patients) => {

        console.log('Patients received:', patients);

        this.totalPatients = patients.length;

        console.log(
          'Total Patients:',
          this.totalPatients
        );

        this.cdr.detectChanges();

        this.isLoading = false;

      },

      error: (error) => {

        console.error(
          'Patients API Error:',
          error
        );

        this.hasError = true;
        this.isLoading = false;

        this.cdr.detectChanges();

      }

    });


    // -----------------------------------
    // Get Appointments
    // -----------------------------------

    this.appointmentService.getAppoinments().subscribe({

      next: (appointments) => {

        console.log(
          'Appointments received:',
          appointments
        );


        // Total appointments

        this.totalAppointments =
          appointments.length;


        // Scheduled / pending appointments

        this.pendingAppointments =
          appointments.filter(
            appointment =>
              appointment.status?.toLowerCase() ===
              'scheduled'
          ).length;


        // Upcoming appointments

        this.upcomingAppointments =
          appointments
            .filter(
              appointment =>
                appointment.status?.toLowerCase() ===
                'scheduled'
            )
            .sort(
              (a, b) =>
                new Date(
                  a.appointmentDate
                ).getTime() -
                new Date(
                  b.appointmentDate
                ).getTime()
            )
            .slice(0, 5);


        console.log(
          'Total Appointments:',
          this.totalAppointments
        );

        console.log(
          'Pending Appointments:',
          this.pendingAppointments
        );

        console.log(
          'Upcoming Appointments:',
          this.upcomingAppointments
        );


        this.cdr.detectChanges();

        this.isLoading = false;

      },

      error: (error) => {

        console.error(
          'Appointments API Error:',
          error
        );

        this.hasError = true;
        this.isLoading = false;

        this.cdr.detectChanges();

      }

    });

  }


  // -----------------------------------
  // Format appointment date
  // -----------------------------------

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


  // -----------------------------------
  // Get patient initials
  // -----------------------------------

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


  // -----------------------------------
  // Navigation
  // -----------------------------------

  goToDashboard(): void {

    this.router.navigate(['/']);

  }


  goToDoctors(): void {

    this.router.navigate(['/doctors']);

  }


  goToPatients(): void {

    this.router.navigate(['/patients']);

  }


  goToAppointments(): void {

    this.router.navigate(['/appointments']);

  }

}