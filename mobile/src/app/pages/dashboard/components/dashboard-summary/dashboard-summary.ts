import { Component, Input } from '@angular/core';

import { DashboardResumo } from '../../../../core/models/dashboard.model';
import { StatCard } from '../../../../shared/components/display/stat-card/stat-card';

@Component({
  selector: 'app-dashboard-summary',
  imports: [StatCard],
  templateUrl: './dashboard-summary.html',
  styleUrl: './dashboard-summary.scss'
})
export class DashboardSummary {
  @Input({ required: true })
  resumo!: DashboardResumo;

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}