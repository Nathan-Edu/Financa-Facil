import { Component, Input } from '@angular/core';

import { Receita } from '../../../../core/models/receita.model';
import { Despesa } from '../../../../core/models/despesa.model';

import { Card } from '../../../../shared/components/layout/card/card';
import { TransactionItem } from '../../../../shared/components/display/transaction-item/transaction-item';
import { EmptyState } from '../../../../shared/components/feedback/empty-state/empty-state';

@Component({
  selector: 'app-dashboard-transactions',
  imports: [
    Card,
    TransactionItem,
    EmptyState
  ],
  templateUrl: './dashboard-transactions.html',
  styleUrl: './dashboard-transactions.scss'
})
export class DashboardTransactions {
  @Input() receitas: Receita[] = [];
  @Input() despesas: Despesa[] = [];
}