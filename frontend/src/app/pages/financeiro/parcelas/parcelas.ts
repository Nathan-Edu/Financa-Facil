import { Component, OnInit } from '@angular/core';

import { Parcela } from '../../../core/models/parcela.model';
import { Categoria } from '../../../core/models/categoria.model';

import { ParcelaService } from '../../../core/services/parcela.service';
import { CategoriaService } from '../../../core/services/categoria.service';

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
import { Badge } from '../../../shared/components/display/badge/badge';

import { Modal } from '../../../shared/components/feedback/modal/modal';
import { ConfirmDialog } from '../../../shared/components/feedback/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/components/feedback/empty-state/empty-state';

import { Pagination } from '../../../shared/components/tables/pagination/pagination';

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
    Badge,
    Modal,
    ConfirmDialog,
    EmptyState,
    Pagination
  ],
  templateUrl: './parcelas.html',
  styleUrl: './parcelas.scss'
})
export class Parcelas implements OnInit {
  showModal = false;
  showParcelasModal = false;
  showConfirmPagamento = false;
  showConfirmExclusao = false;

  parcelaSelecionada: Parcela | null = null;

  search = '';
  status = 'Todos';

  descricao = '';
  categoriaFormulario = '';
  valorTotal = 0;
  totalParcelasInput = '1';
  parcelasPagasInput = '0';
  dataVencimento = '';
  observacao = '';

  currentPage = 1;
  readonly itemsPerPage = 8;

  statusOptions = [
    'Todos',
    'Ativa',
    'Finalizada',
    'Atrasada'
  ];

  categoriasFormulario: string[] = [];
  parcelas: Parcela[] = [];

  constructor(
    private parcelaService: ParcelaService,
    private categoriaService: CategoriaService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.carregarParcelas();
    this.carregarCategorias();
  }

  carregarParcelas(): void {
    this.parcelaService.listar().subscribe({
      next: (parcelas: Parcela[]) => {
        this.parcelas = parcelas;
      },
      error: () => {
        this.toast.error(
          'Erro ao carregar contas parceladas.'
        );
      }
    });
  }

  carregarCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: (categorias: Categoria[]) => {
        this.categoriasFormulario = categorias
          .filter(
            (categoria) =>
              categoria.ativa &&
              categoria.tipo === 'despesa'
          )
          .map((categoria) => categoria.nome);

        if (
          !this.categoriaFormulario &&
          this.categoriasFormulario.length > 0
        ) {
          this.categoriaFormulario =
            this.categoriasFormulario[0];
        }
      },
      error: () => {
        this.toast.error(
          'Erro ao carregar categorias.'
        );
      }
    });
  }

  get parcelasFiltradas(): Parcela[] {
    const busca = this.search
      .trim()
      .toLowerCase();

    return this.parcelas.filter((parcela) => {
      const combinaBusca =
        parcela.descricao
          .toLowerCase()
          .includes(busca) ||
        parcela.categoria
          .toLowerCase()
          .includes(busca);

      const combinaStatus =
        this.status === 'Todos' ||
        this.formatarStatus(parcela.status) ===
          this.status;

      return combinaBusca && combinaStatus;
    });
  }

  get totalAberto(): string {
    const total = this.parcelas
      .filter(
        (parcela) =>
          parcela.status !== 'finalizada'
      )
      .reduce((soma, parcela) => {
        const restantes =
          parcela.totalParcelas -
          parcela.parcelasPagas;

        return soma +
          restantes * parcela.valorParcela;
      }, 0);

    return this.formatarMoeda(total);
  }

  get parcelasPaginadas(): Parcela[] {
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    return this.parcelasFiltradas.slice(inicio, inicio + this.itemsPerPage);
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.parcelasFiltradas.length / this.itemsPerPage)); }

  get contasAtivas(): string {
    return this.parcelas
      .filter(
        (parcela) =>
          parcela.status === 'ativa'
      )
      .length
      .toString();
  }

  get contasFinalizadas(): string {
    return this.parcelas
      .filter(
        (parcela) =>
          parcela.status === 'finalizada'
      )
      .length
      .toString();
  }

  get proximoVencimento(): string {
    const contasEmAberto = this.parcelas
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
      );

    if (contasEmAberto.length === 0) {
      return '-';
    }

    return this.formatarData(
      contasEmAberto[0].dataVencimento
    );
  }

  get tituloModal(): string {
    return this.parcelaSelecionada
      ? 'Editar Conta Parcelada'
      : 'Nova Conta Parcelada';
  }

  get subtituloModal(): string {
    return this.parcelaSelecionada
      ? 'Atualize os dados da conta parcelada'
      : 'Cadastre uma nova compra parcelada';
  }

  get historicoParcelas(): number[] {
    if (!this.parcelaSelecionada) {
      return [];
    }

    return Array.from(
      {
        length:
          this.parcelaSelecionada.totalParcelas
      },
      (_, index) => index + 1
    );
  }

  abrirNovaParcela(): void {
    this.parcelaSelecionada = null;

    this.descricao = '';
    this.categoriaFormulario =
      this.categoriasFormulario[0] ?? '';
    this.valorTotal = 0;
    this.totalParcelasInput = '1';
    this.parcelasPagasInput = '0';
    this.dataVencimento = '';
    this.observacao = '';

    this.showModal = true;
  }

  editar(parcela: Parcela): void {
    this.parcelaSelecionada = parcela;

    this.descricao = parcela.descricao;
    this.categoriaFormulario =
      parcela.categoria;
    this.valorTotal = parcela.valorTotal;
    this.totalParcelasInput =
      parcela.totalParcelas.toString();
    this.parcelasPagasInput =
      parcela.parcelasPagas.toString();
    this.dataVencimento =
      parcela.status === 'finalizada'
        ? ''
        : parcela.dataVencimento;
    this.observacao =
      parcela.observacao ?? '';

    this.showModal = true;
  }

  salvar(): void {
    const totalParcelas =
      Number(this.totalParcelasInput);

    const parcelasPagas =
      Number(this.parcelasPagasInput);

    if (!this.descricao.trim()) {
      this.toast.warning(
        'Informe a descrição da conta.'
      );
      return;
    }

    if (!this.categoriaFormulario) {
      this.toast.warning(
        'Selecione uma categoria.'
      );
      return;
    }

    if (this.valorTotal <= 0) {
      this.toast.warning(
        'Informe um valor total maior que zero.'
      );
      return;
    }

    if (
      !Number.isInteger(totalParcelas) ||
      totalParcelas <= 0
    ) {
      this.toast.warning(
        'Informe uma quantidade válida de parcelas.'
      );
      return;
    }

    if (
      !Number.isInteger(parcelasPagas) ||
      parcelasPagas < 0 ||
      parcelasPagas > totalParcelas
    ) {
      this.toast.warning(
        'Informe uma quantidade válida de parcelas pagas.'
      );
      return;
    }

    if (!this.dataVencimento) {
      this.toast.warning(
        'Informe o próximo vencimento.'
      );
      return;
    }

    if (this.parcelaSelecionada) {
      this.atualizarParcela();
      return;
    }

    this.criarParcela();
  }

  private criarParcela(): void {
    this.parcelaService
      .criar({
        descricao: this.descricao.trim(),
        categoria: this.categoriaFormulario,
        valorTotal: this.valorTotal,
        parcelasPagas: 0,
        totalParcelas:
          Number(this.totalParcelasInput),
        dataVencimento: this.dataVencimento,
        observacao:
          this.observacao.trim() || undefined
      })
      .subscribe({
        next: () => {
          this.toast.success(
            'Conta parcelada cadastrada com sucesso.'
          );

          this.fecharModal();
          this.carregarParcelas();
        },
        error: () => {
          this.toast.error(
            'Erro ao cadastrar conta parcelada.'
          );
        }
      });
  }

  private atualizarParcela(): void {
    if (!this.parcelaSelecionada) {
      return;
    }

    const totalParcelas =
      Number(this.totalParcelasInput);

    const parcelasPagas = Math.min(
      Number(this.parcelasPagasInput),
      totalParcelas
    );

    const parcelaAtualizada: Parcela = {
      ...this.parcelaSelecionada,
      descricao: this.descricao.trim(),
      categoria: this.categoriaFormulario,
      valorTotal: this.valorTotal,
      totalParcelas,
      parcelasPagas,
      dataVencimento:
        this.dataVencimento,
      observacao:
        this.observacao.trim() || undefined
    };

    this.parcelaService
      .editar(parcelaAtualizada)
      .subscribe({
        next: (ok: boolean) => {
          if (!ok) {
            this.toast.error(
              'Conta parcelada não encontrada.'
            );
            return;
          }

          this.toast.success(
            'Conta parcelada atualizada com sucesso.'
          );

          this.fecharModal();
          this.carregarParcelas();
        },
        error: () => {
          this.toast.error(
            'Erro ao atualizar conta parcelada.'
          );
        }
      });
  }

  solicitarPagamento(
    parcela: Parcela
  ): void {
    this.parcelaSelecionada = parcela;
    this.showConfirmPagamento = true;
  }

  confirmarPagamento(): void {
    if (!this.parcelaSelecionada) {
      return;
    }

    this.parcelaService
      .pagar(this.parcelaSelecionada.id)
      .subscribe({
        next: (ok: boolean) => {
          if (!ok) {
            this.toast.warning(
              'Esta conta já está finalizada.'
            );
            return;
          }

          this.toast.success(
            'Pagamento registrado com sucesso.'
          );

          this.showConfirmPagamento = false;
          this.parcelaSelecionada = null;

          this.carregarParcelas();
        },
        error: () => {
          this.toast.error(
            'Erro ao registrar pagamento.'
          );
        }
      });
  }

  cancelarPagamento(): void {
    this.showConfirmPagamento = false;
    this.parcelaSelecionada = null;
  }

  solicitarExclusao(
    parcela: Parcela
  ): void {
    this.parcelaSelecionada = parcela;
    this.showConfirmExclusao = true;
  }

  confirmarExclusao(): void {
    if (!this.parcelaSelecionada) {
      return;
    }

    this.parcelaService
      .excluir(this.parcelaSelecionada.id)
      .subscribe({
        next: (ok: boolean) => {
          if (!ok) {
            this.toast.error(
              'Conta parcelada não encontrada.'
            );
            return;
          }

          this.toast.success(
            'Conta parcelada excluída com sucesso.'
          );

          this.showConfirmExclusao = false;
          this.parcelaSelecionada = null;

          this.carregarParcelas();
        },
        error: () => {
          this.toast.error(
            'Erro ao excluir conta parcelada.'
          );
        }
      });
  }

  cancelarExclusao(): void {
    this.showConfirmExclusao = false;
    this.parcelaSelecionada = null;
  }

  verParcelas(parcela: Parcela): void {
    this.parcelaSelecionada = parcela;
    this.showParcelasModal = true;
  }

  fecharParcelasModal(): void {
    this.showParcelasModal = false;
    this.parcelaSelecionada = null;
  }

  fecharModal(): void {
    this.showModal = false;
    this.parcelaSelecionada = null;
  }

  parcelaEstaPaga(numero: number): boolean {
    return (
      numero <=
      (
        this.parcelaSelecionada
          ?.parcelasPagas ?? 0
      )
    );
  }

  buscarCategoria(
    nome: string
  ): Categoria | undefined {
    return this.categoriaService
      .buscarPorNome(nome);
  }

  formatarStatus(
    status: Parcela['status']
  ): string {
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
    return valor.toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    );
  }

  formatarData(data: string): string {
    if (
      !data ||
      data === 'Finalizada'
    ) {
      return data || '-';
    }

    if (data.includes('/')) {
      return data;
    }

    const [ano, mes, dia] =
      data.split('-');

    return `${dia}/${mes}/${ano}`;
  }

  mudarPagina(page: number): void {
    this.currentPage = page;
  }

  private converterData(
    data: string
  ): Date {
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
