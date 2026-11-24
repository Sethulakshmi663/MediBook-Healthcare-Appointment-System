
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Appoinments as AppointmentService } from '../../service/appoinments';
import { Patients } from '../../service/patients';
import { DoctorService } from '../../service/doctor';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './appoinments.html',
  styleUrl: './appoinments.css'
})
export class Appointments implements OnInit {
  constructor(private appointmentService: AppointmentService, private patientService: Patients, private doctorService: DoctorService, private fb: FormBuilder, private cdr: ChangeDetectorRef) {}

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
  userRole = (localStorage.getItem('role') || '').toLowerCase();

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
    if (this.userRole === 'patient') {
      this.appointmentForm.get('patientId')?.clearValidators();
      this.appointmentForm.get('patientId')?.updateValueAndValidity();
    }
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.appointmentService.getAppoinments().subscribe({
      next: data => {
        this.appointments = data;
        this.isLoading = false;
        this.hasError = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error loading appointments:', error);
        this.isLoading = false;
        this.hasError = true;
        this.cdr.detectChanges();
      }
    });
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: data => this.patients = data,
      error: error => console.error('Error loading patients:', error)
    });
  }

  loadDoctors(): void {
    this.doctorService.getDoctors().subscribe({
      next: data => this.doctors = data,
      error: error => console.error('Error loading doctors:', error)
    });
  }

  getPatientName(id: number): string {
    return this.patients.find(p => p.id === id)?.name || 'Unknown Patient';
  }

  getDoctorName(id: number): string {
    return this.doctors.find(d => d.id === id)?.name || 'Unknown Doctor';
  }

  openAddForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.selectedAppointmentId = null;
    this.appointmentForm.reset({ patientId: '', doctorId: '', appointmentDate: '', appointmentTime: '', status: 'Scheduled', reason: '' });
  }

  editAppointment(appointment: any): void {
    this.showForm = true;
    this.isEditing = true;
    this.selectedAppointmentId = appointment.id;
    this.appointmentForm.patchValue({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentDate: appointment.appointmentDate?.substring(0, 10) || '',
      appointmentTime: appointment.appointmentTime,
      status: appointment.status,
      reason: appointment.reason
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedAppointmentId = null;
    this.appointmentForm.reset({ patientId: '', doctorId: '', appointmentDate: '', appointmentTime: '', status: 'Scheduled', reason: '' });
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    const data = this.appointmentForm.getRawValue();

    if (this.isEditing && this.selectedAppointmentId !== null) {
      this.appointmentService.updateAppoinment(this.selectedAppointmentId, data).subscribe({
        next: () => {
          this.successMessage = 'Appointment updated successfully!';
          this.errorMessage = '';
          this.closeForm();
          this.loadAppointments();
          this.showSuccessMessage();
        },
        error: error => {
          console.error('Error updating appointment:', error);
          this.errorMessage = 'Failed to update appointment.';
          this.successMessage = '';
        }
      });
    } else {
      this.appointmentService.addAppoinment(data).subscribe({
        next: () => {
          this.successMessage = 'Appointment added successfully!';
          this.errorMessage = '';
          this.closeForm();
          this.loadAppointments();
          this.showSuccessMessage();
        },
        error: error => {
          console.error('Error adding appointment:', error);
          this.errorMessage = 'Failed to add appointment.';
          this.successMessage = '';
        }
      });
    }
  }

  deleteAppointment(id: number): void {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    this.appointmentService.deleteAppoinment(id).subscribe({
      next: () => {
        this.successMessage = 'Appointment deleted successfully!';
        this.errorMessage = '';
        this.loadAppointments();
        this.showSuccessMessage();
      },
      error: error => {
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
