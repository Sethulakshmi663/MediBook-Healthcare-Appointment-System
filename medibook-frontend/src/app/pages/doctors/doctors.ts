
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { DoctorService } from '../../service/doctor';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-doctors',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './doctors.html',
  styleUrl: './doctors.css'
})
export class Doctors implements OnInit {

  // Doctor list
  doctors: any[] = [];

  // Page states
  isLoading = true;
  hasError = false;

  // Form
  doctorForm!: FormGroup;
  showForm = false;

  successMessage = '';
  errorMessage = '';


  isEditMode = false;
  selectedDoctorId: number | null = null;

  searchText = '';
  selectedSpecialization = '';

  filteredDoctors: any[] = [];
  constructor(
    private doctorService: DoctorService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.loadDoctors();
  }

  // Create Reactive Form
  createForm(): void {

    this.doctorForm = this.fb.group({

      name: ['', Validators.required],

      specialization: ['', Validators.required],

      experience: ['', Validators.required],

      isAvailable: [true]

    });

  }

  // Get doctors from API
  loadDoctors(): void {

    this.isLoading = true;
    this.hasError = false;

    this.doctorService.getDoctors().subscribe({

      next: (data) => {

        console.log('API response:', data);

        this.doctors = data;
        this.filteredDoctors = data;      

        console.log('Total doctors:', this.doctors.length);

        this.isLoading = false;

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error('API error:', error);

        this.isLoading = false;
        this.hasError = true;

        this.cdr.detectChanges();

      }

    });

  }

  // Open Add Doctor form
  // Open Add Doctor form
openAddForm(): void {

  this.isEditMode = false;
  this.selectedDoctorId = null;
  this.showForm = true;

  this.doctorForm.reset({
    name: '',
    specialization: '',
    experience: '',
    isAvailable: true
  });

}

  // Close Add Doctor form
  closeForm(): void {

    this.showForm = false;

    this.doctorForm.reset({
      name: '',
      specialization: '',
      experience: '',
      isAvailable: true
    });

  }

  // Submit form
  
// Submit form
// Submit form
onSubmit(): void {

  if (this.doctorForm.invalid) {
    this.doctorForm.markAllAsTouched();
    return;
  }

  const doctorData = this.doctorForm.value;

  this.doctorService.addDoctor(doctorData).subscribe({

    next: (response) => {

      console.log('Doctor saved successfully:', response);

      this.successMessage = 'Doctor saved successfully!';
      this.errorMessage = '';

      this.closeForm();
      this.loadDoctors();

      // Hide success toast after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
        this.cdr.detectChanges();
      }, 3000);

    },

    error: (error) => {

      console.error('Error saving doctor:', error);

      this.errorMessage = 'Failed to save doctor. Please try again.';
      this.successMessage = '';

      // Hide error toast after 3 seconds
      setTimeout(() => {
        this.errorMessage = '';
        this.cdr.detectChanges();
      }, 3000);

    }

  });

}
// Delete doctor
// Delete doctor
deleteDoctor(id: number): void {
  const confirmDelete = confirm(
    'Are you sure you want to delete this doctor?'
  );

  if (!confirmDelete) {
    return;
  }

  this.doctorService.deleteDoctor(id).subscribe({
    next: () => {
      console.log('Doctor deleted successfully');

      // Remove doctor from both arrays
      this.doctors = this.doctors.filter(
        doctor => doctor.id !== id
      );

      this.filteredDoctors = this.filteredDoctors.filter(
        doctor => doctor.id !== id
      );

      this.successMessage = 'Doctor deleted successfully!';
      this.errorMessage = '';

      this.cdr.detectChanges();

      setTimeout(() => {
        this.successMessage = '';
        this.cdr.detectChanges();
      }, 3000);
    },

    error: (error) => {
      console.error('Error deleting doctor:', error);

      this.errorMessage = 'Failed to delete doctor.';
      this.successMessage = '';

      this.cdr.detectChanges();

      setTimeout(() => {
        this.errorMessage = '';
        this.cdr.detectChanges();
      }, 3000);
    }
  });
}
// Open Edit Doctor form
editDoctor(doctor: any): void {

  this.isEditMode = true;
  this.selectedDoctorId = doctor.id;
  this.showForm = true;

  this.doctorForm.patchValue({
    name: doctor.name,
    specialization: doctor.specialization,
    experience: doctor.experience,
    isAvailable: doctor.isAvailable
  });

}
// Update doctor
updateDoctor(): void {

  if (
    this.doctorForm.invalid ||
    this.selectedDoctorId === null
  ) {
    this.doctorForm.markAllAsTouched();
    return;
  }

  const doctorData = this.doctorForm.value;

  this.doctorService.updateDoctor(
    this.selectedDoctorId,
    doctorData
  ).subscribe({

    next: () => {

      this.successMessage = 'Doctor updated successfully!';
      this.errorMessage = '';

      this.closeForm();
      this.loadDoctors();

      setTimeout(() => {
        this.successMessage = '';
        this.cdr.detectChanges();
      }, 3000);

    },

    error: (error) => {

      console.error('Error updating doctor:', error);

      this.errorMessage = 'Failed to update doctor.';
      this.successMessage = '';

      this.cdr.detectChanges();

      setTimeout(() => {
        this.errorMessage = '';
        this.cdr.detectChanges();
      }, 3000);

    }

  });

}
// Search and filter doctors
filterDoctors(): void {

  this.filteredDoctors = this.doctors.filter(doctor => {

    const matchesName =
      doctor.name
        .toLowerCase()
        .includes(this.searchText.toLowerCase());

    const matchesSpecialization =
      this.selectedSpecialization === '' ||
      doctor.specialization === this.selectedSpecialization;

    return matchesName && matchesSpecialization;

  });

}
onSearch(event: Event): void {

  const input = event.target as HTMLInputElement;

  this.searchText = input.value;

  this.filterDoctors();

}

onSpecializationChange(event: Event): void {

  const select = event.target as HTMLSelectElement;

  this.selectedSpecialization = select.value;

  this.filterDoctors();

}
}

