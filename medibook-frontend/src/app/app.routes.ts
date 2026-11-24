
import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Doctors } from './pages/doctors/doctors';
import { PatientsComponent } from './pages/patients/patients';
import { Appointments } from './pages/appoinments/appoinments';
import { Settings } from './pages/settings/settings';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { authGuard } from './service/auth-guard';

export const routes: Routes = [

  {
    path: 'login',
    component: Login
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path:'register',
    component:Register
  },

  {
    path: 'dashboard',
    component: Dashboard,canActivate:[authGuard]
  },

  {
    path: 'doctors',
    component: Doctors,canActivate:[authGuard]
  },

  {
    path: 'patients',
    component: PatientsComponent,canActivate:[authGuard]
  },

  {
    path: 'appointments',
    component: Appointments,canActivate:[authGuard]
  },

  {
    path: 'settings',
    component: Settings,canActivate:[authGuard]
  }

];
