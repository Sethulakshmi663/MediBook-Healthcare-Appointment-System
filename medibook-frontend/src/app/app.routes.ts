import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Doctors } from './pages/doctors/doctors';
import {  PatientsComponent } from './pages/patients/patients';
import { Appointments } from './pages/appoinments/appoinments';


export const routes: Routes = [

    {
        path: '',
        component:Dashboard
    },
    {
        path:'doctors',
        component:Doctors
    },
    {
        path:'patients',
        component:PatientsComponent
    },
    {
        path:'appointments',
        component:Appointments
    }

];
