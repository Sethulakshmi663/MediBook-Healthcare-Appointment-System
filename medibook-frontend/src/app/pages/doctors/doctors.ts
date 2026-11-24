
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { DoctorService } from '../../service/doctor';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './doctors.html',
  styleUrl: './doctors.css'
})
export class Doctors implements OnInit {

  doctors: any[] = [];
  filteredDoctors: any[] = [];
  doctorForm!: FormGroup;

  isLoading = true;
  hasError = false;
  showForm = false;
  isEditMode = false;
  selectedDoctorId: number | null = null;

  successMessage = '';
  errorMessage = '';
  searchText = '';
  selectedSpecialization = '';

  constructor(
    private doctorService: DoctorService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.loadDoctors();
  }

  createForm(): void {
    this.doctorForm = this.fb.group({
      name: ['', Validators.required],
      specialization: ['', Validators.required],
      experience: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      isAvailable: [true]
    });
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.hasError = false;

    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.filterDoctors();
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

  openAddForm(): void {
    this.isEditMode = false;
    this.selectedDoctorId = null;
    this.showForm = true;

    this.doctorForm.reset({
      name: '',
      specialization: '',
      experience: '',
      email: '',
      password: '',
      isAvailable: true
    });

    this.doctorForm.get('email')?.setValidators([Validators.required, Validators.email]);
    this.doctorForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.doctorForm.updateValueAndValidity();
  }

  closeForm(): void {
    this.showForm = false;
    this.doctorForm.reset({
      name: '',
      specialization: '',
      experience: '',
      email: '',
      password: '',
      isAvailable: true
    });
  }

  onSubmit(): void {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }

    const doctorData = this.doctorForm.value;

    this.doctorService.createDoctorAccount(doctorData).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Doctor account created successfully!';
        this.errorMessage = '';
        this.closeForm();
        this.loadDoctors();
        this.showSuccessMessage();
      },
      error: (error) => {
        console.error('Error creating doctor account:', error);
        this.errorMessage = error.error?.message || 'Failed to create doctor account.';
        this.successMessage = '';
        this.cdr.detectChanges();
        this.showErrorMessage();
      }
    });
  }

  editDoctor(doctor: any): void {
    this.isEditMode = true;
    this.selectedDoctorId = doctor.id;
    this.showForm = true;

    this.doctorForm.patchValue({
      name: doctor.name,
      specialization: doctor.specialization,
      experience: doctor.experience,
      email: '',
      password: '',
      isAvailable: doctor.isAvailable
    });

    this.doctorForm.get('email')?.clearValidators();
    this.doctorForm.get('password')?.clearValidators();
    this.doctorForm.get('email')?.updateValueAndValidity();
    this.doctorForm.get('password')?.updateValueAndValidity();
  }

  updateDoctor(): void {
    if (this.doctorForm.invalid || this.selectedDoctorId === null) {
      this.doctorForm.markAllAsTouched();
      return;
    }

    const doctorData = {
      name: this.doctorForm.value.name,
      specialization: this.doctorForm.value.specialization,
      experience: this.doctorForm.value.experience,
      isAvailable: this.doctorForm.value.isAvailable
    };

    this.doctorService.updateDoctor(this.selectedDoctorId, doctorData).subscribe({
      next: () => {
        this.successMessage = 'Doctor updated successfully!';
        this.errorMessage = '';
        this.closeForm();
        this.loadDoctors();
        this.showSuccessMessage();
      },
      error: (error) => {
        console.error('Error updating doctor:', error);
        this.errorMessage = 'Failed to update doctor.';
        this.successMessage = '';
        this.cdr.detectChanges();
        this.showErrorMessage();
      }
    });
  }

  deleteDoctor(id: number): void {
    if (!confirm('Are you sure you want to delete this doctor?')) return;

    this.doctorService.deleteDoctor(id).subscribe({
      next: () => {
        this.doctors = this.doctors.filter(doctor => doctor.id !== id);
        this.filterDoctors();
        this.successMessage = 'Doctor deleted successfully!';
        this.errorMessage = '';
        this.cdr.detectChanges();
        this.showSuccessMessage();
      },
      error: (error) => {
        console.error('Error deleting doctor:', error);
        this.errorMessage = 'Failed to delete doctor.';
        this.successMessage = '';
        this.cdr.detectChanges();
        this.showErrorMessage();
      }
    });
  }

  filterDoctors(): void {
    this.filteredDoctors = this.doctors.filter(doctor => {
      const matchesName = doctor.name?.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesSpecialization = !this.selectedSpecialization || doctor.specialization === this.selectedSpecialization;
      return matchesName && matchesSpecialization;
    });
  }

  onSearch(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value;
    this.filterDoctors();
  }

  onSpecializationChange(event: Event): void {
    this.selectedSpecialization = (event.target as HTMLSelectElement).value;
    this.filterDoctors();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  showSuccessMessage(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  showErrorMessage(): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }
}
