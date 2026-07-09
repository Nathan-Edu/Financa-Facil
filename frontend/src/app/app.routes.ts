import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Receitas } from './pages/financeiro/receitas/receitas';
import { Despesas } from './pages/financeiro/despesas/despesas';
import { Parcelas } from './pages/financeiro/parcelas/parcelas'; 
import { Playground } from './pages/dev/playground/playground';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'receitas', component: Receitas },
  { path: 'despesas', component: Despesas },
  { path: 'parcelas', component: Parcelas },
  { path: 'playground', component: Playground },
  { path: '**', redirectTo: '' }
];