import { Component, OnInit } from '@angular/core';

import { Receita } from '../../../core/models/receita.model';
import { Categoria } from '../../../core/models/categoria.model';

import { ReceitaService } from '../../../core/services/receita.service';
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
  selector: 'app-receitas',
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
  templateUrl: './receitas.html',
  styleUrl: './receitas.scss'
})
export class Receitas implements OnInit {
  showModal = false;
  showConfirmDialog = false;

  receitaSelecionada: Receita | null = null;

  search = '';
  categoria = 'Todas';

  descricao = '';
  categoriaFormulario = '';
  valor = 0;
  data = '';
  observacao = '';
  recorrente = false;
  frequenciaRecorrencia: NonNullable<Receita['frequenciaRecorrencia']> = 'mensal';
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

  receitas: Receita[] = [];

  constructor(
    private receitaService: ReceitaService,
    private categoriaService: CategoriaService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.carregarReceitas();
    this.carregarCategorias();
  }

  carregarReceitas(): void {
    this.receitaService.listar().subscribe({
      next: (receitas: Receita[]) => {
        this.receitas = receitas;
      },
      error: () => {
        this.toast.error('Erro ao carregar receitas.');
      }
    });
  }

  carregarCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: (categorias: Categoria[]) => {
        const categoriasReceita = categorias
          .filter(
            (categoria) =>
              categoria.ativa &&
              categoria.tipo === 'receita'
          )
          .map((categoria) => categoria.nome);

        this.categoriasFormulario = categoriasReceita;
        this.categorias = ['Todas', ...categoriasReceita];

        if (
          !this.categoriaFormulario &&
          categoriasReceita.length > 0
        ) {
          this.categoriaFormulario =
            categoriasReceita[0];
        }
      },
      error: () => {
        this.toast.error(
          'Erro ao carregar categorias de receitas.'
        );
      }
    });
  }

  get receitasFiltradas(): Receita[] {
    const busca = this.search
      .trim()
      .toLowerCase();

    return this.receitas.filter((receita) => {
      const combinaBusca =
        receita.descricao
          .toLowerCase()
          .includes(busca) ||
        receita.categoria
          .toLowerCase()
          .includes(busca);

      const combinaCategoria =
        this.categoria === 'Todas' ||
        receita.categoria === this.categoria;

      return combinaBusca && combinaCategoria;
    });
  }

  get totalRecebido(): string {
    const total = this.receitas.reduce(
      (soma, receita) =>
        soma + receita.valor,
      0
    );

    return this.formatarMoeda(total);
  }

  get receitasPaginadas(): Receita[] {
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    return this.receitasFiltradas.slice(inicio, inicio + this.itemsPerPage);
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.receitasFiltradas.length / this.itemsPerPage)); }

  get totalMesAtual(): string {
    const hoje = new Date();

    const total = this.receitas
      .filter((receita) => {
        const dataReceita =
          this.converterData(receita.data);

        return (
          dataReceita.getMonth() ===
            hoje.getMonth() &&
          dataReceita.getFullYear() ===
            hoje.getFullYear()
        );
      })
      .reduce(
        (soma, receita) =>
          soma + receita.valor,
        0
      );

    return this.formatarMoeda(total);
  }

  get quantidadeReceitas(): string {
    return this.receitas.length.toString();
  }

  get tituloModal(): string {
    return this.receitaSelecionada
      ? 'Editar Receita'
      : 'Nova Receita';
  }

  get subtituloModal(): string {
    return this.receitaSelecionada
      ? 'Atualize os dados da receita'
      : 'Cadastre uma nova entrada financeira';
  }

  abrirNovaReceita(): void {
    this.receitaSelecionada = null;

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

  editarReceita(receita: Receita): void {
    this.receitaSelecionada = receita;

    this.descricao = receita.descricao;
    this.categoriaFormulario =
      receita.categoria;
    this.valor = receita.valor;
    this.data = receita.data;
    this.observacao =
      receita.observacao ?? '';
    this.recorrente = receita.recorrente ?? false;
    this.frequenciaRecorrencia = receita.frequenciaRecorrencia ?? 'mensal';
    this.recorrenteAte = receita.recorrenteAte ?? '';

    this.showModal = true;
  }

  salvarReceita(): void {
    if (!this.descricao.trim()) {
      this.toast.warning(
        'Informe a descrição da receita.'
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
        'Informe a data da receita.'
      );
      return;
    }

    if (this.recorrente && this.recorrenteAte && this.recorrenteAte <= this.data) {
      this.toast.warning('A data final da recorrência deve ser posterior à primeira receita.');
      return;
    }

    if (this.receitaSelecionada) {
      this.atualizarReceita();
      return;
    }

    this.criarReceita();
  }

  private criarReceita(): void {
    this.receitaService
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
            'Receita cadastrada com sucesso.'
          );

          this.fecharModal();
          this.carregarReceitas();
        },
        error: () => {
          this.toast.error(
            'Erro ao cadastrar receita.'
          );
        }
      });
  }

  private atualizarReceita(): void {
    if (!this.receitaSelecionada) {
      return;
    }

    const receitaAtualizada: Receita = {
      ...this.receitaSelecionada,
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

    this.receitaService
      .editar(receitaAtualizada)
      .subscribe({
        next: (ok: boolean) => {
          if (!ok) {
            this.toast.error(
              'Receita não encontrada.'
            );
            return;
          }

          this.toast.success(
            'Receita atualizada com sucesso.'
          );

          this.fecharModal();
          this.carregarReceitas();
        },
        error: () => {
          this.toast.error(
            'Erro ao atualizar receita.'
          );
        }
      });
  }

  solicitarExclusao(
    receita: Receita
  ): void {
    this.receitaSelecionada = receita;
    this.showConfirmDialog = true;
  }

  confirmarExclusao(): void {
    if (!this.receitaSelecionada) {
      return;
    }

    this.receitaService
      .excluir(this.receitaSelecionada.id)
      .subscribe({
        next: (ok: boolean) => {
          if (!ok) {
            this.toast.error(
              'Receita não encontrada.'
            );
            return;
          }

          this.toast.success(
            'Receita excluída com sucesso.'
          );

          this.showConfirmDialog = false;
          this.receitaSelecionada = null;

          this.carregarReceitas();
        },
        error: () => {
          this.toast.error(
            'Erro ao excluir receita.'
          );
        }
      });
  }

  cancelarExclusao(): void {
    this.showConfirmDialog = false;
    this.receitaSelecionada = null;
  }

  fecharModal(): void {
    this.showModal = false;
    this.receitaSelecionada = null;
  }

  mudarPagina(page: number): void {
    this.currentPage = page;
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  buscarCategoria(nome: string): Categoria | undefined {
  return this.categoriaService.buscarPorNome(nome);
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
