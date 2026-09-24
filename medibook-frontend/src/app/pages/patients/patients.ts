
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Patients } from '../../service/patients';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './patients.html',
  styleUrl: './patients.css'
})
export class PatientsComponent implements OnInit {

  private patientService = inject(Patients);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  patients: any[] = [];
  filteredPatients: any[] = [];

  patientForm!: FormGroup;

  showForm = false;
  isEditMode = false;
  selectedPatientId: number | null = null;

  isLoading = true;
  hasError = false;

  successMessage = '';
  errorMessage = '';

  searchText = '';

  ngOnInit(): void {
    this.createForm();
    this.loadPatients();
  }

  createForm(): void {
    this.patientForm = this.fb.group({
      name: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1)]],
      gender: ['', Validators.required],
      phone: ['', Validators.required],
      email: [''],
      address: ['']
    });
  }

  loadPatients(): void {
    this.isLoading = true;

    this.patientService.getPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.filteredPatients = data;

        this.isLoading = false;
        this.hasError = false;
      },

      error: (error) => {
        console.error('Error loading patients:', error);

        this.isLoading = false;
        this.hasError = true;
      }
    });
  }

  openAddForm(): void {
    this.isEditMode = false;
    this.selectedPatientId = null;
    this.showForm = true;

    this.patientForm.reset();
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.selectedPatientId = null;

    this.patientForm.reset();
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    const patientData = this.patientForm.value;

    this.patientService.addPatient(patientData).subscribe({
      next: () => {
        this.successMessage = 'Patient added successfully!';
        this.errorMessage = '';

        this.closeForm();
        this.loadPatients();

        this.showSuccessMessage();
      },

      error: (error) => {
        console.error('Error adding patient:', error);

        this.errorMessage = 'Failed to add patient.';
        this.successMessage = '';
      }
    });
  }

  editPatient(patient: any): void {
    this.isEditMode = true;
    this.selectedPatientId = patient.id;
    this.showForm = true;

    this.patientForm.patchValue({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      address: patient.address
    });
  }

  updatePatient(): void {
    if (this.patientForm.invalid || this.selectedPatientId === null) {
      this.patientForm.markAllAsTouched();
      return;
    }

    const patientData = this.patientForm.value;

    this.patientService.updatePatient(
      this.selectedPatientId,
      patientData
    ).subscribe({
      next: () => {
        this.successMessage = 'Patient updated successfully!';
        this.errorMessage = '';

        this.closeForm();
        this.loadPatients();

        this.showSuccessMessage();
      },

      error: (error) => {
        console.error('Error updating patient:', error);

        this.errorMessage = 'Failed to update patient.';
        this.successMessage = '';
      }
    });
  }

  deletePatient(id: number): void {
    const confirmDelete = confirm(
      'Are you sure you want to delete this patient?'
    );

    if (!confirmDelete) {
      return;
    }

    this.patientService.deletePatient(id).subscribe({
      next: () => {
        this.patients = this.patients.filter(
          patient => patient.id !== id
        );

        this.filteredPatients = this.filteredPatients.filter(
          patient => patient.id !== id
        );

        this.successMessage = 'Patient deleted successfully!';
        this.errorMessage = '';

        this.showSuccessMessage();
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error deleting patient:', error);

        this.errorMessage = 'Failed to delete patient.';
        this.successMessage = '';

        this.cdr.detectChanges();
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchText = input.value.toLowerCase();

    this.filteredPatients = this.patients.filter(patient =>
      patient.name.toLowerCase().includes(this.searchText)
    );
  }

  showSuccessMessage(): void {
    this.cdr.detectChanges();

    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }
}