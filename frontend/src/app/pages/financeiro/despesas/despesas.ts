import { Component, OnInit } from '@angular/core';

import { Despesa } from '../../../core/models/despesa.model';
import { DespesaService } from '../../../core/services/despesa.service';
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
import { FinanceItem } from '../../../shared/components/display/finance-item/finance-item';

import { Modal } from '../../../shared/components/feedback/modal/modal';
import { EmptyState } from '../../../shared/components/feedback/empty-state/empty-state';
import { Pagination } from '../../../shared/components/tables/pagination/pagination';

import { Categoria } from '../../../core/models/categoria.model';
import { CategoriaService } from '../../../core/services/categoria.service';

@Component({
  selector: 'app-despesas',
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
    FinanceItem,
    Modal,
    EmptyState,
    Pagination
  ],
  templateUrl: './despesas.html',
  styleUrl: './despesas.scss',
})
export class Despesas implements OnInit {
  showModal = false;

  search = '';
  categoria = 'Todas';

  currentPage = 1;
  totalPages = 1;

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
      next: (despesas) => {
        this.despesas = despesas;
      },
      error: () => {
        this.toast.error('Erro ao carregar despesas.');
      }
    });
  }

  get despesasFiltradas(): Despesa[] {
    return this.despesas.filter((despesa) => {
      const busca = this.search.toLowerCase();

      const combinaBusca =
        despesa.descricao.toLowerCase().includes(busca) ||
        despesa.categoria.toLowerCase().includes(busca);

      const combinaCategoria =
        this.categoria === 'Todas' || despesa.categoria === this.categoria;

      return combinaBusca && combinaCategoria;
    });
  }

  salvar(): void {
    this.showModal = false;
    this.toast.success('Despesa cadastrada com sucesso.');
  }

  editar(): void {
    this.toast.info('Edição de despesa será implementada.');
  }

  excluir(): void {
    this.toast.warning('Exclusão de despesa será implementada.');
  }

  mudarPagina(page: number): void {
    this.currentPage = page;
  }

  carregarCategorias(): void {
  this.categoriaService.listar().subscribe({
    next: (categorias: Categoria[]) => {
      const categoriasDespesa = categorias
        .filter((categoria) =>
          categoria.ativa &&
          categoria.tipo === 'despesa'
        )
        .map((categoria) => categoria.nome);

      this.categoriasFormulario = categoriasDespesa;
      this.categorias = ['Todas', ...categoriasDespesa];
    },
    error: () => {
      this.toast.error('Erro ao carregar categorias de despesas.');
    }
  });
}
}