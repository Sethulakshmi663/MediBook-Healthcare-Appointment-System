import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:7056/api/Doctors';

  getDoctors() {
    return this.http.get<any[]>(this.apiUrl);
  }
  addDoctor(doctor: any) {
    return this.http.post<any>(this.apiUrl, doctor);
  }
  updateDoctor( id: number, doctor: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, doctor);
  }
  deleteDoctor(id: number) {
  return this.http.delete(
    `${this.apiUrl}/${id}`,
    { responseType: 'text' }
  );
}
}