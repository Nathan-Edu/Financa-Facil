import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login) },
  { path: 'cadastro', loadComponent: () => import('./pages/auth/cadastro/cadastro').then((m) => m.Cadastro) },
  { path: 'recuperar-senha', loadComponent: () => import('./pages/auth/recuperar-senha/recuperar-senha').then((m) => m.RecuperarSenha) },
  { path: 'redefinir-senha', loadComponent: () => import('./pages/auth/redefinir-senha/redefinir-senha').then((m) => m.RedefinirSenha) },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/main-layout/main-layout').then((m) => m.MainLayout),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'receitas', loadComponent: () => import('./pages/financeiro/receitas/receitas').then((m) => m.Receitas) },
      { path: 'despesas', loadComponent: () => import('./pages/financeiro/despesas/despesas').then((m) => m.Despesas) },
      { path: 'parcelas', loadComponent: () => import('./pages/financeiro/parcelas/parcelas').then((m) => m.Parcelas) },
      { path: 'alertas', loadComponent: () => import('./pages/financeiro/alertas/alertas').then((m) => m.Alertas) },
      { path: 'categorias', loadComponent: () => import('./pages/financeiro/categorias/categorias').then((m) => m.Categorias) },
      { path: 'relatorios', loadComponent: () => import('./pages/relatorios/relatorios').then((m) => m.Relatorios) },
      { path: 'minha-conta', loadComponent: () => import('./pages/conta/minha-conta/minha-conta').then((m) => m.MinhaConta) },
      { path: 'alterar-senha', loadComponent: () => import('./pages/auth/alterar-senha/alterar-senha').then((m) => m.AlterarSenha) },
      { path: 'perfis-financeiros', loadComponent: () => import('./pages/conta/perfis-financeiros/perfis-financeiros').then((m) => m.PerfisFinanceiros) },
      { path: 'playground', loadComponent: () => import('./pages/dev/playground/playground').then((m) => m.Playground) }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
