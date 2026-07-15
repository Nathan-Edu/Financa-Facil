import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { Alerta } from '../../../core/models/alerta.model';
import { AlertaService } from '../../../core/services/alerta.service';

import { ToastService } from '../../../shared/components/feedback/toast/toast.service';

import { PageHeader } from '../../../shared/components/layout/page-header/page-header';
import { Card } from '../../../shared/components/layout/card/card';

import { StatCard } from '../../../shared/components/display/stat-card/stat-card';
import { AlertItem } from '../../../shared/components/display/alert-item/alert-item';

import { Pagination } from '../../../shared/components/tables/pagination/pagination';
import { ConfirmDialog } from '../../../shared/components/feedback/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-alertas',
  imports: [
    PageHeader,
    MatIconModule,
    Card,
    StatCard,
    AlertItem,
    Pagination,
    ConfirmDialog
  ],
  templateUrl: './alertas.html',
  styleUrl: './alertas.scss',
})
export class Alertas implements OnInit {

  currentPage = 1;
  totalPages = 1;

  alertas: Alerta[] = [];

  showConfirmDialog = false;
  
  alertaSelecionado: Alerta | null = null;

  constructor(
    private alertaService: AlertaService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.carregarAlertas();
  }

  carregarAlertas(): void {
    this.alertaService.listar().subscribe({
      next: (alertas: Alerta[]) => {
        this.alertas = alertas.filter(a => !a.descartado);
      },
      error: () => {
        this.toast.error('Erro ao carregar alertas.');
      }
    });
  }

  get totalAlertas(): string {
    return this.alertas.length.toString();
  }

  get naoVisualizados(): string {
    return this.alertas
      .filter(a => !a.visualizado)
      .length
      .toString();
  }

  get visualizados(): string {
    return this.alertas
      .filter(a => a.visualizado)
      .length
      .toString();
  }

  get altaPrioridade(): string {
    return this.alertas
      .filter(a => a.prioridade === 'alta')
      .length
      .toString();
  }

  marcarComoLido(alerta: Alerta): void {

  this.alertaService.marcarComoLido(alerta.id).subscribe({

    next: () => {

      this.toast.success('Alerta marcado como lido.');

      this.carregarAlertas();

    }

  });

}

  descartar(alerta: Alerta): void {

    this.alertaSelecionado = alerta;

    this.showConfirmDialog = true;

  }

  

  mudarPagina(page: number): void {
    this.currentPage = page;
  }

  confirmarDescarte(): void {

  if (!this.alertaSelecionado) {

    return;

  }

  this.alertaService
    .descartar(this.alertaSelecionado.id)
    .subscribe({

      next: () => {

        this.toast.info('Alerta descartado.');

        this.showConfirmDialog = false;

        this.alertaSelecionado = null;

        this.carregarAlertas();

      }

    });

}

cancelarDescarte(): void {

  this.showConfirmDialog = false;

  this.alertaSelecionado = null;

}

}