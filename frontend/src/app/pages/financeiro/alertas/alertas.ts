import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { Alerta } from '../../../core/models/alerta.model';
import { AlertaService } from '../../../core/services/alerta.service';

import { ToastService } from '../../../shared/components/feedback/toast/toast.service';

import { PageHeader } from '../../../shared/components/layout/page-header/page-header';
import { Card } from '../../../shared/components/layout/card/card';

import { SearchInput } from '../../../shared/components/forms/search-input/search-input';
import { Select } from '../../../shared/components/forms/select/select';

import { StatCard } from '../../../shared/components/display/stat-card/stat-card';
import { AlertItem } from '../../../shared/components/display/alert-item/alert-item';

import { EmptyState } from '../../../shared/components/feedback/empty-state/empty-state';
import { ConfirmDialog } from '../../../shared/components/feedback/confirm-dialog/confirm-dialog';

import { Pagination } from '../../../shared/components/tables/pagination/pagination';
import { Button } from '../../../shared/components/forms/button/button';

@Component({
  selector: 'app-alertas',
  imports: [
    PageHeader,
    MatIconModule,
    Card,
    SearchInput,
    Select,
    StatCard,
    AlertItem,
    EmptyState,
    ConfirmDialog,
    Button,
    Pagination
  ],
  templateUrl: './alertas.html',
  styleUrl: './alertas.scss'
})
export class Alertas implements OnInit {
  currentPage = 1;
  totalPages = 1;

  search = '';
  filtroLeitura = 'Todos';
  filtroPrioridade = 'Todas';
  filtroExibicao = 'Ativos';

  alertas: Alerta[] = [];

  showConfirmDialog = false;
  alertaSelecionado: Alerta | null = null;

  showFilters = false;

  leituraOptions = [
    'Todos',
    'Não visualizados',
    'Visualizados'
  ];

  prioridadeOptions = [
    'Todas',
    'Alta',
    'Média',
    'Baixa'
  ];

  exibicaoOptions = [
    'Ativos',
    'Descartados',
    'Todos'
  ];

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
        this.alertas = alertas;
      },
      error: () => {
        this.toast.error(
          'Erro ao carregar alertas.'
        );
      }
    });
  }

  get alertasFiltrados(): Alerta[] {
    const busca = this.search
      .trim()
      .toLowerCase();

    return this.alertas.filter((alerta) => {
      const combinaBusca =
        alerta.titulo
          .toLowerCase()
          .includes(busca) ||
        alerta.descricao
          .toLowerCase()
          .includes(busca);

      const combinaLeitura =
        this.filtroLeitura === 'Todos' ||
        (
          this.filtroLeitura ===
            'Não visualizados' &&
          !alerta.visualizado
        ) ||
        (
          this.filtroLeitura ===
            'Visualizados' &&
          alerta.visualizado
        );

      const prioridadeFormatada =
        this.formatarPrioridade(
          alerta.prioridade
        );

      const combinaPrioridade =
        this.filtroPrioridade === 'Todas' ||
        prioridadeFormatada ===
          this.filtroPrioridade;

      const combinaExibicao =
        this.filtroExibicao === 'Todos' ||
        (
          this.filtroExibicao === 'Ativos' &&
          !alerta.descartado
        ) ||
        (
          this.filtroExibicao ===
            'Descartados' &&
          alerta.descartado
        );

      return (
        combinaBusca &&
        combinaLeitura &&
        combinaPrioridade &&
        combinaExibicao
      );
    });
  }

  get alertasAtivos(): Alerta[] {
    return this.alertas.filter(
      (alerta) => !alerta.descartado
    );
  }

  get totalAlertas(): string {
    return this.alertasAtivos
      .length
      .toString();
  }

  get naoVisualizados(): string {
    return this.alertasAtivos
      .filter(
        (alerta) => !alerta.visualizado
      )
      .length
      .toString();
  }

  get visualizados(): string {
    return this.alertasAtivos
      .filter(
        (alerta) => alerta.visualizado
      )
      .length
      .toString();
  }

  get altaPrioridade(): string {
    return this.alertasAtivos
      .filter(
        (alerta) =>
          alerta.prioridade === 'alta'
      )
      .length
      .toString();
  }

  marcarComoLido(alerta: Alerta): void {
    this.alertaService
      .marcarComoLido(alerta.id)
      .subscribe({
        next: (ok: boolean) => {
          if (!ok) {
            this.toast.error(
              'Alerta não encontrado.'
            );
            return;
          }

          this.toast.success(
            'Alerta marcado como lido.'
          );

          this.carregarAlertas();
        },
        error: () => {
          this.toast.error(
            'Erro ao atualizar alerta.'
          );
        }
      });
  }

  marcarComoNaoLido(
    alerta: Alerta
  ): void {
    this.alertaService
      .marcarComoNaoLido(alerta.id)
      .subscribe({
        next: (ok: boolean) => {
          if (!ok) {
            this.toast.error(
              'Alerta não encontrado.'
            );
            return;
          }

          this.toast.info(
            'Alerta marcado como não lido.'
          );

          this.carregarAlertas();
        },
        error: () => {
          this.toast.error(
            'Erro ao atualizar alerta.'
          );
        }
      });
  }

  solicitarDescarte(
    alerta: Alerta
  ): void {
    this.alertaSelecionado = alerta;
    this.showConfirmDialog = true;
  }

  confirmarDescarte(): void {
    if (!this.alertaSelecionado) {
      return;
    }

    this.alertaService
      .descartar(
        this.alertaSelecionado.id
      )
      .subscribe({
        next: (ok: boolean) => {
          if (!ok) {
            this.toast.error(
              'Alerta não encontrado.'
            );
            return;
          }

          this.toast.info(
            'Alerta descartado.'
          );

          this.fecharConfirmacao();
          this.carregarAlertas();
        },
        error: () => {
          this.toast.error(
            'Erro ao descartar alerta.'
          );
        }
      });
  }

  restaurar(alerta: Alerta): void {
    this.alertaService
      .restaurar(alerta.id)
      .subscribe({
        next: (ok: boolean) => {
          if (!ok) {
            this.toast.error(
              'Alerta não encontrado.'
            );
            return;
          }

          this.toast.success(
            'Alerta restaurado com sucesso.'
          );

          this.carregarAlertas();
        },
        error: () => {
          this.toast.error(
            'Erro ao restaurar alerta.'
          );
        }
      });
  }

  cancelarDescarte(): void {
    this.fecharConfirmacao();
  }

  mudarPagina(page: number): void {
    this.currentPage = page;
  }

  formatarPrioridade(
    prioridade: Alerta['prioridade']
  ): string {
    switch (prioridade) {
      case 'alta':
        return 'Alta';

      case 'media':
        return 'Média';

      default:
        return 'Baixa';
    }
  }

  private fecharConfirmacao(): void {
    this.showConfirmDialog = false;
    this.alertaSelecionado = null;
  }

  limparFiltros(): void {
  this.search = '';
  this.filtroLeitura = 'Todos';
  this.filtroPrioridade = 'Todas';
  this.filtroExibicao = 'Ativos';
}
}