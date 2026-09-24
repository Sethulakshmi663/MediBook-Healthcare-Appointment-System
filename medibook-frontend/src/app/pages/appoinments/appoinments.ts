
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Appoinments as AppointmentService } from '../../service/appoinments';

import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { Patients } from '../../service/patients';
import { DoctorService } from '../../service/doctor';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './appoinments.html',
  styleUrl: './appoinments.css'
})
export class Appointments implements OnInit {

  private appointmentService = inject(AppointmentService);
  private patientService = inject(Patients);
  private doctorService = inject(DoctorService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  appointments: any[] = [];
  patients: any[] = [];
  doctors: any[] = [];

  appointmentForm!: FormGroup;

  showForm = false;
  isEditing = false;
  selectedAppointmentId: number | null = null;

  isLoading = true;
  hasError = false;

  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.createForm();
    this.loadAppointments();
    this.loadPatients();
    this.loadDoctors();
  }

  createForm(): void {
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      status: ['Scheduled', Validators.required],
      reason: ['', Validators.required]
    });
  }

  loadAppointments(): void {
    this.isLoading = true;

    this.appointmentService.getAppoinments().subscribe({
      next: (data) => {
        this.appointments = data;
        this.isLoading = false;
        this.hasError = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.isLoading = false;
        this.hasError = true;
        this.cdr.detectChanges();
      }
    });
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (data) => {
        this.patients = data;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
      }
    });
  }

  loadDoctors(): void {
    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
      }
    });
  }

  getPatientName(patientId: number): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  }

  getDoctorName(doctorId: number): string {
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'Unknown Doctor';
  }

  openAddForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.selectedAppointmentId = null;

    this.appointmentForm.reset({
      patientId: '',
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
      status: 'Scheduled',
      reason: ''
    });
  }

  editAppointment(appointment: any): void {
    this.showForm = true;
    this.isEditing = true;
    this.selectedAppointmentId = appointment.id;

    const formattedDate = appointment.appointmentDate
      ? appointment.appointmentDate.substring(0, 10)
      : '';

    this.appointmentForm.patchValue({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentDate: formattedDate,
      appointmentTime: appointment.appointmentTime,
      status: appointment.status,
      reason: appointment.reason
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedAppointmentId = null;

    this.appointmentForm.reset({
      patientId: '',
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
      status: 'Scheduled',
      reason: ''
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    const appointmentData = this.appointmentForm.value;

    if (this.isEditing && this.selectedAppointmentId !== null) {

      this.appointmentService.updateAppoinment(
        this.selectedAppointmentId,
        appointmentData
      ).subscribe({
        next: () => {
          this.successMessage = 'Appointment updated successfully!';
          this.errorMessage = '';

          this.closeForm();
          this.loadAppointments();
          this.showSuccessMessage();
        },
        error: (error) => {
          console.error('Error updating appointment:', error);
          this.errorMessage = 'Failed to update appointment.';
          this.successMessage = '';
        }
      });

    } else {

      this.appointmentService.addAppoinment(appointmentData).subscribe({
        next: () => {
          this.successMessage = 'Appointment added successfully!';
          this.errorMessage = '';

          this.closeForm();
          this.loadAppointments();
          this.showSuccessMessage();
        },
        error: (error) => {
          console.error('Error adding appointment:', error);
          this.errorMessage = 'Failed to add appointment.';
          this.successMessage = '';
        }
      });

    }
  }

  deleteAppointment(id: number): void {
    const confirmDelete = confirm(
      'Are you sure you want to delete this appointment?'
    );

    if (!confirmDelete) {
      return;
    }

    this.appointmentService.deleteAppoinment(id).subscribe({
      next: () => {
        this.successMessage = 'Appointment deleted successfully!';
        this.errorMessage = '';

        this.loadAppointments();
        this.showSuccessMessage();
      },
      error: (error) => {
        console.error('Error deleting appointment:', error);
        this.errorMessage = 'Failed to delete appointment.';
        this.successMessage = '';
      }
    });
  }

  showSuccessMessage(): void {
    this.cdr.detectChanges();

    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }
}