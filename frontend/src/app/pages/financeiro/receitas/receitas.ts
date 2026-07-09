import { Component, OnInit } from '@angular/core';

import { Receita } from '../../../core/models/receita.model';
import { ReceitaService } from '../../../core/services/receita.service';
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

@Component({
  selector: 'app-receitas',
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
  templateUrl: './receitas.html',
  styleUrl: './receitas.scss',
})
export class Receitas implements OnInit {
  showModal = false;

  search = '';
  categoria = 'Todas';

  currentPage = 1;
  totalPages = 1;

  categorias = ['Todas', 'Trabalho', 'Freelance', 'Investimentos', 'Outros'];

  receitas: Receita[] = [];

  constructor(
    private receitaService: ReceitaService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.carregarReceitas();
  }

  carregarReceitas(): void {
    this.receitaService.listar().subscribe({
      next: (receitas) => {
        this.receitas = receitas;
      },
      error: () => {
        this.toast.error('Erro ao carregar receitas.');
      }
    });
  }

  get receitasFiltradas(): Receita[] {
    return this.receitas.filter((receita) => {
      const busca = this.search.toLowerCase();

      const combinaBusca =
        receita.descricao.toLowerCase().includes(busca) ||
        receita.categoria.toLowerCase().includes(busca);

      const combinaCategoria =
        this.categoria === 'Todas' || receita.categoria === this.categoria;

      return combinaBusca && combinaCategoria;
    });
  }

  salvarReceita(): void {
    this.showModal = false;
    this.toast.success('Receita cadastrada com sucesso.');
  }

  editarReceita(): void {
    this.toast.info('Edição de receita será implementada.');
  }

  excluirReceita(): void {
    this.toast.warning('Exclusão de receita será implementada.');
  }

  mudarPagina(page: number): void {
    this.currentPage = page;
  }
}