import { Component, OnInit } from '@angular/core';

import { DashboardResumo } from '../../core/models/dashboard.model';
import { DashboardService } from '../../core/services/dashboard.service';

import { PageHeader } from '../../shared/components/layout/page-header/page-header';

import { DashboardSummary } from './components/dashboard-summary/dashboard-summary';
import { DashboardTransactions } from './components/dashboard-transactions/dashboard-transactions';
import { DashboardPayments } from './components/dashboard-payments/dashboard-payments';
import { DashboardAlerts } from './components/dashboard-alerts/dashboard-alerts';
import { DashboardQuickActions } from './components/dashboard-quick-actions/dashboard-quick-actions';
import { DashboardAnalysis } from './components/dashboard-analysis/dashboard-analysis';
import { DashboardCategories } from './components/dashboard-categories/dashboard-categories';

@Component({
  selector: 'app-dashboard',
  imports: [
    PageHeader,
    DashboardSummary,
    DashboardTransactions,
    DashboardPayments,
    DashboardAlerts,
    DashboardQuickActions,
    DashboardAnalysis,
    DashboardCategories
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  resumo: DashboardResumo = {
    saldo: 0,
    totalReceitas: 0,
    totalDespesas: 0,
    totalParceladas: 0,

    ultimasReceitas: [],
    ultimasDespesas: [],
    parcelasAtivas: [],
    alertas: [],
    categorias: []
  };

  loading = true;

  constructor(
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.carregarDashboard();
  }

  carregarDashboard(): void {
    this.dashboardService.resumo().subscribe({
      next: (resumo: DashboardResumo) => {
        this.resumo = resumo;
        this.loading = false;
      },
      error: () => {
        this.loading = false;

        console.error(
          'Erro ao carregar dados do Dashboard.'
        );
      }
    });
  }
}