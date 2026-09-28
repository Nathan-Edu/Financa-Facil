import { Component, Input } from '@angular/core';

import { Router } from '@angular/router';

import { Receita } from '../../../../core/models/receita.model';

import { Despesa } from '../../../../core/models/despesa.model';

import { Categoria } from '../../../../core/models/categoria.model';

import { CategoriaService } from '../../../../core/services/categoria.service';

import { Card } from '../../../../shared/components/layout/card/card';

import { Button } from '../../../../shared/components/forms/button/button';

import { TransactionItem } from '../../../../shared/components/display/transaction-item/transaction-item';

import { EmptyState } from '../../../../shared/components/feedback/empty-state/empty-state';

@Component({
  selector: 'app-dashboard-transactions',

  imports: [
    Card,
    Button,
    TransactionItem,
    EmptyState
  ],

  templateUrl: './dashboard-transactions.html',

  styleUrl: './dashboard-transactions.scss'
})
export class DashboardTransactions {

  @Input() receitas: Receita[] = [];

  @Input() despesas: Despesa[] = [];

  constructor(
    private categoriaService: CategoriaService,
    private router: Router
  ) {}

  buscarCategoria(
    nome: string
  ): Categoria | undefined {

    return this.categoriaService
      .buscarPorNome(nome);

  }

  abrirReceitas(): void {

    this.router.navigate([
      '/receitas'
    ]);

  }

  abrirDespesas(): void {

    this.router.navigate([
      '/despesas'
    ]);

  }

}