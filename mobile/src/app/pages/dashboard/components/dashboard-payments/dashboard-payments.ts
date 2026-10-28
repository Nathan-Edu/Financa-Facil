import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Parcela } from '../../../../core/models/parcela.model';

import { Card } from '../../../../shared/components/layout/card/card';
import { Button } from '../../../../shared/components/forms/button/button';
import { Badge } from '../../../../shared/components/display/badge/badge';
import { EmptyState } from '../../../../shared/components/feedback/empty-state/empty-state';

@Component({
  selector: 'app-dashboard-payments',
  imports: [
    Card,
    Button,
    Badge,
    EmptyState
  ],
  templateUrl: './dashboard-payments.html',
  styleUrl: './dashboard-payments.scss'
})
export class DashboardPayments {
  @Input() parcelas: Parcela[] = [];

  constructor(
    private router: Router
  ) {}

  get proximosPagamentos(): Parcela[] {
    return [...this.parcelas]
      .filter(
        (parcela) =>
          parcela.status !== 'finalizada' &&
          parcela.dataVencimento !== 'Finalizada'
      )
      .sort(
        (a, b) =>
          this.converterData(
            a.dataVencimento
          ).getTime() -
          this.converterData(
            b.dataVencimento
          ).getTime()
      )
      .slice(0, 3);
  }

  abrirParceladas(): void {
    this.router.navigate(['/parcelas']);
  }

  formatarData(data: string): string {
    if (!data) {
      return '-';
    }

    if (data.includes('/')) {
      return data;
    }

    const [ano, mes, dia] =
      data.split('-');

    return `${dia}/${mes}/${ano}`;
  }

  private converterData(data: string): Date {
    if (data.includes('/')) {
      const [dia, mes, ano] =
        data.split('/').map(Number);

      return new Date(
        ano,
        mes - 1,
        dia
      );
    }

    const [ano, mes, dia] =
      data.split('-').map(Number);

    return new Date(
      ano,
      mes - 1,
      dia
    );
  }
}