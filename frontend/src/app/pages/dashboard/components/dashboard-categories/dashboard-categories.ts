import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Categoria } from '../../../../core/models/categoria.model';

import { Card } from '../../../../shared/components/layout/card/card';
import { Button } from '../../../../shared/components/forms/button/button';
import { EmptyState } from '../../../../shared/components/feedback/empty-state/empty-state';

@Component({
  selector: 'app-dashboard-categories',
  imports: [
    Card,
    Button,
    EmptyState
  ],
  templateUrl: './dashboard-categories.html',
  styleUrl: './dashboard-categories.scss'
})
export class DashboardCategories {
  @Input() categorias: Categoria[] = [];

  constructor(
    private router: Router
  ) {}

  get categoriasOrcamento(): Categoria[] {
    return this.categorias
      .filter(
        (categoria) =>
          categoria.ativa &&
          categoria.tipo === 'despesa' &&
          (categoria.orcamentoMensal ?? 0) > 0
      )
      .slice(0, 4);
  }

  abrirCategorias(): void {
    this.router.navigate(['/categorias']);
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}