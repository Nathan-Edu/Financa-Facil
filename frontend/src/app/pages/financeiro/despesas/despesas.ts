import { Component, OnInit } from '@angular/core';

import { Despesa } from '../../../core/models/despesa.model';
import { Categoria } from '../../../core/models/categoria.model';

import { DespesaService } from '../../../core/services/despesa.service';
import { CategoriaService } from '../../../core/services/categoria.service';

import { ToastService } from '../../../shared/components/feedback/toast/toast.service';

import { PageHeader } from '../../../shared/components/layout/page-header/page-header';
import { Card } from '../../../shared/components/layout/card/card';

import { Button } from '../../../shared/components/forms/button/button';
import { SearchInput } from '../../../shared/components/forms/search-input/search-input';
import { Select, SelectOption } from '../../../shared/components/forms/select/select';
import { Checkbox } from '../../../shared/components/forms/checkbox/checkbox';
import { CurrencyInput } from '../../../shared/components/forms/currency-input/currency-input';
import { DateInput } from '../../../shared/components/forms/date-input/date-input';
import { Textarea } from '../../../shared/components/forms/textarea/textarea';

import { StatCard } from '../../../shared/components/display/stat-card/stat-card';
import { FinanceItem } from '../../../shared/components/display/finance-item/finance-item';

import { Modal } from '../../../shared/components/feedback/modal/modal';
import { ConfirmDialog } from '../../../shared/components/feedback/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/components/feedback/empty-state/empty-state';

import { Pagination } from '../../../shared/components/tables/pagination/pagination';

@Component({
  selector: 'app-despesas',
  imports: [
    PageHeader,
    Card,
    Button,
    SearchInput,
    Select,
    Checkbox,
    CurrencyInput,
    DateInput,
    Textarea,
    StatCard,
    FinanceItem,
    Modal,
    ConfirmDialog,
    EmptyState,
    Pagination
  ],
  templateUrl: './despesas.html',
  styleUrl: './despesas.scss'
})
export class Despesas implements OnInit {
  showModal = false;
  showConfirmDialog = false;

  despesaSelecionada: Despesa | null = null;

  search = '';
  categoria = 'Todas';

  descricao = '';
  categoriaFormulario = '';
  valor = 0;
  data = '';
  observacao = '';
  recorrente = false;
  frequenciaRecorrencia: NonNullable<Despesa['frequenciaRecorrencia']> = 'mensal';
  recorrenteAte = '';
  readonly frequenciasRecorrencia: SelectOption[] = [
    { label: 'Semanal', value: 'semanal' },
    { label: 'Mensal', value: 'mensal' },
    { label: 'Anual', value: 'anual' }
  ];

  currentPage = 1;
  readonly itemsPerPage = 8;

  categorias: string[] = ['Todas'];
  categoriasFormulario: string[] = [];

  despesas: Despesa[] = [];

  constructor(
    private despesaService: DespesaService,
    private categoriaService: CategoriaService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.carregarDespesas();
    this.carregarCategorias();
  }

  carregarDespesas(): void {
    this.despesaService.listar().subscribe({
      next: (despesas: Despesa[]) => {
        this.despesas = despesas;
      },
      error: () => {
        this.toast.error(
          'Erro ao carregar despesas.'
        );
      }
    });
  }

  carregarCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: (categorias: Categoria[]) => {
        const categoriasDespesa = categorias
          .filter(
            (categoria) =>
              categoria.ativa &&
              categoria.tipo === 'despesa'
          )
          .map((categoria) => categoria.nome);

        this.categoriasFormulario = categoriasDespesa;
        this.categorias = [
          'Todas',
          ...categoriasDespesa
        ];

        if (
          !this.categoriaFormulario &&
          categoriasDespesa.length > 0
        ) {
          this.categoriaFormulario =
            categoriasDespesa[0];
        }
      },
      error: () => {
        this.toast.error(
          'Erro ao carregar categorias de despesas.'
        );
      }
    });
  }

  get despesasFiltradas(): Despesa[] {
    const busca = this.search
      .trim()
      .toLowerCase();

    return this.despesas.filter((despesa) => {
      const combinaBusca =
        despesa.descricao
          .toLowerCase()
          .includes(busca) ||
        despesa.categoria
          .toLowerCase()
          .includes(busca);

      const combinaCategoria =
        this.categoria === 'Todas' ||
        despesa.categoria === this.categoria;

      return combinaBusca && combinaCategoria;
    });
  }

  get totalGasto(): string {
    const total = this.despesas.reduce(
      (soma, despesa) =>
        soma + despesa.valor,
      0
    );

    return this.formatarMoeda(total);
  }

  get despesasPaginadas(): Despesa[] {
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    return this.despesasFiltradas.slice(inicio, inicio + this.itemsPerPage);
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.despesasFiltradas.length / this.itemsPerPage)); }

  get totalMesAtual(): string {
    const hoje = new Date();

    const total = this.despesas
      .filter((despesa) => {
        const dataDespesa =
          this.converterData(despesa.data);

        return (
          dataDespesa.getMonth() ===
            hoje.getMonth() &&
          dataDespesa.getFullYear() ===
            hoje.getFullYear()
        );
      })
      .reduce(
        (soma, despesa) =>
          soma + despesa.valor,
        0
      );

    return this.formatarMoeda(total);
  }

  get quantidadeDespesas(): string {
    return this.despesas.length.toString();
  }

  get tituloModal(): string {
    return this.despesaSelecionada
      ? 'Editar Despesa'
      : 'Nova Despesa';
  }

  get subtituloModal(): string {
    return this.despesaSelecionada
      ? 'Atualize os dados da despesa'
      : 'Cadastre uma nova saída financeira';
  }

  abrirNovaDespesa(): void {
    this.despesaSelecionada = null;

    this.descricao = '';
    this.categoriaFormulario =
      this.categoriasFormulario[0] ?? '';
    this.valor = 0;
    this.data = '';
    this.observacao = '';
    this.recorrente = false;
    this.frequenciaRecorrencia = 'mensal';
    this.recorrenteAte = '';

    this.showModal = true;
  }

  editarDespesa(despesa: Despesa): void {
    this.despesaSelecionada = despesa;

    this.descricao = despesa.descricao;
    this.categoriaFormulario =
      despesa.categoria;
    this.valor = despesa.valor;
    this.data = despesa.data;
    this.observacao =
      despesa.observacao ?? '';
    this.recorrente = despesa.recorrente ?? false;
    this.frequenciaRecorrencia = despesa.frequenciaRecorrencia ?? 'mensal';
    this.recorrenteAte = despesa.recorrenteAte ?? '';

    this.showModal = true;
  }

  salvarDespesa(): void {
    if (!this.descricao.trim()) {
      this.toast.warning(
        'Informe a descrição da despesa.'
      );
      return;
    }

    if (!this.categoriaFormulario) {
      this.toast.warning(
        'Selecione uma categoria.'
      );
      return;
    }

    if (this.valor <= 0) {
      this.toast.warning(
        'Informe um valor maior que zero.'
      );
      return;
    }

    if (!this.data) {
      this.toast.warning(
        'Informe a data da despesa.'
      );
      return;
    }

    if (this.recorrente && this.recorrenteAte && this.recorrenteAte <= this.data) {
      this.toast.warning('A data final da recorrência deve ser posterior à primeira despesa.');
      return;
    }

    if (this.despesaSelecionada) {
      this.atualizarDespesa();
      return;
    }

    this.criarDespesa();
  }

  private criarDespesa(): void {
    this.despesaService
      .criar({
        descricao: this.descricao.trim(),
        categoria: this.categoriaFormulario,
        valor: this.valor,
        data: this.data,
        observacao:
          this.observacao.trim() || undefined,
        recorrente: this.recorrente,
        frequenciaRecorrencia: this.recorrente ? this.frequenciaRecorrencia : undefined,
        recorrenteAte: this.recorrente ? this.recorrenteAte || undefined : undefined
      })
      .subscribe({
        next: () => {
          this.toast.success(
            'Despesa cadastrada com sucesso.'
          );

          this.fecharModal();
          this.carregarDespesas();
        },
        error: () => {
          this.toast.error(
            'Erro ao cadastrar despesa.'
          );
        }
      });
  }

  private atualizarDespesa(): void {
    if (!this.despesaSelecionada) {
      return;
    }

    const despesaAtualizada: Despesa = {
      ...this.despesaSelecionada,
      descricao: this.descricao.trim(),
      categoria: this.categoriaFormulario,
      valor: this.valor,
      data: this.data,
      observacao:
        this.observacao.trim() || undefined,
      recorrente: this.recorrente,
      frequenciaRecorrencia: this.recorrente ? this.frequenciaRecorrencia : undefined,
      recorrenteAte: this.recorrente ? this.recorrenteAte || undefined : undefined
    };

    this.despesaService
      .editar(despesaAtualizada)
      .subscribe({
        next: (ok: boolean) => {
          if (!ok) {
            this.toast.error(
              'Despesa não encontrada.'
            );
            return;
          }

          this.toast.success(
            'Despesa atualizada com sucesso.'
          );

          this.fecharModal();
          this.carregarDespesas();
        },
        error: () => {
          this.toast.error(
            'Erro ao atualizar despesa.'
          );
        }
      });
  }

  solicitarExclusao(
    despesa: Despesa
  ): void {
    this.despesaSelecionada = despesa;
    this.showConfirmDialog = true;
  }

  confirmarExclusao(): void {
    if (!this.despesaSelecionada) {
      return;
    }

    this.despesaService
      .excluir(this.despesaSelecionada.id)
      .subscribe({
        next: (ok: boolean) => {
          if (!ok) {
            this.toast.error(
              'Despesa não encontrada.'
            );
            return;
          }

          this.toast.success(
            'Despesa excluída com sucesso.'
          );

          this.showConfirmDialog = false;
          this.despesaSelecionada = null;

          this.carregarDespesas();
        },
        error: () => {
          this.toast.error(
            'Erro ao excluir despesa.'
          );
        }
      });
  }

  cancelarExclusao(): void {
    this.showConfirmDialog = false;
    this.despesaSelecionada = null;
  }

  fecharModal(): void {
    this.showModal = false;
    this.despesaSelecionada = null;
  }

  mudarPagina(page: number): void {
    this.currentPage = page;
  }

  buscarCategoria(
    nome: string
  ): Categoria | undefined {
    return this.categoriaService
      .buscarPorNome(nome);
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
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
