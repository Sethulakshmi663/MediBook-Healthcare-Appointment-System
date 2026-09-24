import { Injectable , inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Appoinments {
  private http = inject(HttpClient);

 private apiUrl = 'https://localhost:7056/api/Appointments';

  getAppoinments() {
    return this.http.get<any[]>(this.apiUrl);
  }
  addAppoinment(appoinment: any) {
    return this.http.post<any>(this.apiUrl, appoinment);
  }
  updateAppoinment( id: number, appoinment: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, appoinment);
  }
  deleteAppoinment(id: number) {
  return this.http.delete(
    `${this.apiUrl}/${id}`,
    { responseType: 'text' }
  );        
}
}