import { Component, OnInit } from '@angular/core';

import { DashboardService } from '../../core/services/dashboard.service';

import { PageHeader } from '../../shared/components/layout/page-header/page-header';
import { Card } from '../../shared/components/layout/card/card';

import { Button } from '../../shared/components/forms/button/button';

import { StatCard } from '../../shared/components/display/stat-card/stat-card';
import { TransactionItem } from '../../shared/components/display/transaction-item/transaction-item';
import { AlertItem } from '../../shared/components/display/alert-item/alert-item';

@Component({
  selector: 'app-dashboard',
  imports: [
    PageHeader,
    Card,
    Button,
    StatCard,
    TransactionItem,
    AlertItem
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  resumo = {
    saldo: 0,
    receitas: 0,
    despesas: 0,
    parceladas: 0
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.carregarResumo().subscribe((resumo) => {
      this.resumo = resumo;
    });
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}