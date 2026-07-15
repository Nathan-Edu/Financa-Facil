import { Component, OnInit } from '@angular/core';

import { Parcela } from '../../../core/models/parcela.model';
import { ParcelaService } from '../../../core/services/parcela.service';
import { ToastService } from '../../../shared/components/feedback/toast/toast.service';

import { PageHeader } from '../../../shared/components/layout/page-header/page-header';
import { Card } from '../../../shared/components/layout/card/card';

import { Button } from '../../../shared/components/forms/button/button';
import { SearchInput } from '../../../shared/components/forms/search-input/search-input';
import { Select } from '../../../shared/components/forms/select/select';
import { CurrencyInput } from '../../../shared/components/forms/currency-input/currency-input';
import { DateInput } from '../../../shared/components/forms/date-input/date-input';
import { Textarea } from '../../../shared/components/forms/textarea/textarea';

import { StatCard } from '../../../shared/components/display/stat-card/stat-card';
import { ParcelItem } from '../../../shared/components/display/parcel-item/parcel-item';

import { Modal } from '../../../shared/components/feedback/modal/modal';
import { EmptyState } from '../../../shared/components/feedback/empty-state/empty-state';
import { Pagination } from '../../../shared/components/tables/pagination/pagination';
import { Badge } from '../../../shared/components/display/badge/badge';

@Component({
  selector: 'app-parceladas',
  imports: [
    PageHeader,
    Card,
    Button,
    SearchInput,
    Select,
    CurrencyInput,
    DateInput,
    Textarea,
    StatCard,
    ParcelItem,
    Modal,
    EmptyState,
    Pagination,
    Badge
  ],
  templateUrl: './parcelas.html',
  styleUrl: './parcelas.scss',
})
export class Parcelas implements OnInit {
  showModal = false;

  search = '';
  status = 'Todos';

  currentPage = 1;
  totalPages = 1;

  showParcelasModal = false;
  parcelaSelecionada: Parcela | null = null;

  statusOptions = ['Todos', 'Ativa', 'Finalizada', 'Atrasada'];

  parcelas: Parcela[] = [];

  constructor(
    private parcelaService: ParcelaService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.carregarParcelas();
  }

  carregarParcelas(): void {
    this.parcelaService.listar().subscribe({
      next: (parcelas: Parcela[]) => {
        this.parcelas = parcelas;
      },
      error: () => {
        this.toast.error('Erro ao carregar contas parceladas.');
      }
    });
  }

  get parcelasFiltradas(): Parcela[] {
    return this.parcelas.filter((parcela) => {
      const busca = this.search.toLowerCase();

      const combinaBusca =
        parcela.descricao.toLowerCase().includes(busca) ||
        parcela.categoria.toLowerCase().includes(busca);

      const statusFormatado = this.formatarStatus(parcela.status);

      const combinaStatus =
        this.status === 'Todos' || statusFormatado === this.status;

      return combinaBusca && combinaStatus;
    });
  }

  get totalAberto(): string {
  const total = this.parcelas
    .filter((item) => item.status !== 'finalizada')
    .reduce((acc, item) => {
      const parcelasRestantes =
        item.totalParcelas - item.parcelasPagas;

      return acc + parcelasRestantes * item.valorParcela;
    }, 0);

  return this.formatarMoeda(total);
}

  get contasAtivas(): string {
    return this.parcelas
      .filter((item) => item.status === 'ativa')
      .length
      .toString();
  }

  get contasFinalizadas(): string {
    return this.parcelas
      .filter((item) => item.status === 'finalizada')
      .length
      .toString();
  }

  get proximoVencimento(): string {
    const ativa = this.parcelas.find(item => item.status === 'ativa');

    if (!ativa) {
      return '-';
    }

    return this.formatarData(ativa.dataVencimento);
  }

  formatarStatus(status: Parcela['status']): string {
    switch (status) {
      case 'finalizada':
        return 'Finalizada';
      case 'atrasada':
        return 'Atrasada';
      default:
        return 'Ativa';
    }
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  formatarData(data: string): string {

    if (!data || data === 'Finalizada') {
      return data;
    }

    const [ano, mes, dia] = data.split('-');

    return `${dia}/${mes}/${ano}`;

  }

  pagarParcela(parcela: Parcela): void {

  this.parcelaService.pagar(parcela.id).subscribe({

    next: (ok) => {

      if (!ok) {

        this.toast.warning('Esta conta já está finalizada.');

        return;

      }

      this.toast.success('Parcela registrada com sucesso.');

      this.carregarParcelas();

    }

  });

}

  salvar(): void {
    this.showModal = false;
    this.toast.success('Conta parcelada cadastrada com sucesso.');
  }

  verParcelas(parcela: Parcela): void {
  this.parcelaSelecionada = parcela;
  this.showParcelasModal = true;
  }

  editar(parcela: Parcela): void {
    this.toast.info(`Editando ${parcela.descricao}.`);
  }

  mudarPagina(page: number): void {
    this.currentPage = page;
  }

  fecharParcelasModal(): void {
  this.showParcelasModal = false;
  this.parcelaSelecionada = null;
  
  }

    get historicoParcelas(): number[] {
      if (!this.parcelaSelecionada) {
        return [];
      }

      return Array.from(
        { length: this.parcelaSelecionada.totalParcelas },
        (_, index) => index + 1
      );
    }

    parcelaEstaPaga(numero: number): boolean {
      return numero <= (this.parcelaSelecionada?.parcelasPagas ?? 0);
    }

}