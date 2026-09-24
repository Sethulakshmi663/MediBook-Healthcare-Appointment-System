import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Patients {

    private http = inject(HttpClient);

    private apiUrl = 'https://localhost:7056/api/Patients';

    getPatients() {
        return this.http.get<any[]>(this.apiUrl);
    }
    addPatient(patient: any) {
        return this.http.post<any>(this.apiUrl, patient);
    }
    updatePatient( id: number, patient: any) {
        return this.http.put<any>(`${this.apiUrl}/${id}`, patient);
    }
    deletePatient(id: number) {
        return this.http.delete(
            `${this.apiUrl}/${id}`,
            { responseType: 'text' }
        );
    }   

  }

