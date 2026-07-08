import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Playground } from './pages/dev/playground/playground';

export const routes: Routes = [

  {
    path: '',
    component: Dashboard
  },

  {
    path: 'playground',
    component: Playground
  }

];