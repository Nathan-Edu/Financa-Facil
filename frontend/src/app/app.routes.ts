import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

import { MainLayout } from './shared/components/layout/main-layout/main-layout';

import { Login } from './pages/auth/login/login';
import { Cadastro } from './pages/auth/cadastro/cadastro';
import { RecuperarSenha } from './pages/auth/recuperar-senha/recuperar-senha';

import { Dashboard } from './pages/dashboard/dashboard';

import { Receitas } from './pages/financeiro/receitas/receitas';
import { Despesas } from './pages/financeiro/despesas/despesas';
import { Parcelas } from './pages/financeiro/parcelas/parcelas';
import { Alertas } from './pages/financeiro/alertas/alertas';
import { Categorias } from './pages/financeiro/categorias/categorias';
import { Relatorios } from './pages/relatorios/relatorios';

import { MinhaConta } from './pages/conta/minha-conta/minha-conta';
import { PerfisFinanceiros } from './pages/conta/perfis-financeiros/perfis-financeiros';
import { AlterarSenha } from './pages/auth/alterar-senha/alterar-senha';

import { Playground } from './pages/dev/playground/playground';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // ========= AUTENTICAÇÃO =========

  {
    path: 'login',
    component: Login
  },
  {
    path: 'cadastro',
    component: Cadastro
  },
  {
    path: 'recuperar-senha',
    component: RecuperarSenha
  },

  // ========= ÁREA PROTEGIDA =========

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: Dashboard
      },
      {
        path: 'receitas',
        component: Receitas
      },
      {
        path: 'despesas',
        component: Despesas
      },
      {
        path: 'parcelas',
        component: Parcelas
      },
      {
        path: 'alertas',
        component: Alertas
      },
      {
        path: 'categorias',
        component: Categorias
      },
      {
        path: 'minha-conta',
        component: MinhaConta
      },
      {
        path: 'alterar-senha',
        component: AlterarSenha
      },
      {
        path: 'perfis-financeiros',
        component: PerfisFinanceiros
      },

      {
        path: 'playground',
        component: Playground
      },
      {
       path: 'perfis-financeiros',
        component: PerfisFinanceiros
      },
      {
        path: 'relatorios',
        component: Relatorios
      },
    ]
  },

  // ========= ROTA NÃO ENCONTRADA =========

  {
    path: '**',
    redirectTo: 'login'
  }
];  