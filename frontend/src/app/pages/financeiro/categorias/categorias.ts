import {
  Component,
  OnInit
} from '@angular/core';

import {
  forkJoin
} from 'rxjs';

import {
  Categoria
} from '../../../core/models/categoria.model';

import {
  CategoriaService
} from '../../../core/services/categoria.service';

import {
  PerfilFinanceiroService
} from '../../../core/services/perfil-financeiro.service';

import {
  ToastService
} from '../../../shared/components/feedback/toast/toast.service';

import {
  PageHeader
} from '../../../shared/components/layout/page-header/page-header';

import {
  Card
} from '../../../shared/components/layout/card/card';

import {
  Button
} from '../../../shared/components/forms/button/button';

import {
  SearchInput
} from '../../../shared/components/forms/search-input/search-input';

import {
  Select
} from '../../../shared/components/forms/select/select';

import {
  CurrencyInput
} from '../../../shared/components/forms/currency-input/currency-input';

import {
  StatCard
} from '../../../shared/components/display/stat-card/stat-card';

import {
  Badge
} from '../../../shared/components/display/badge/badge';

import {
  Modal
} from '../../../shared/components/feedback/modal/modal';

import {
  ConfirmDialog
} from '../../../shared/components/feedback/confirm-dialog/confirm-dialog';

import {
  EmptyState
} from '../../../shared/components/feedback/empty-state/empty-state';

import {
  Pagination
} from '../../../shared/components/tables/pagination/pagination';

@Component({
  selector: 'app-categorias',

  imports: [
    PageHeader,
    Card,
    Button,
    SearchInput,
    Select,
    CurrencyInput,
    StatCard,
    Badge,
    Modal,
    ConfirmDialog,
    EmptyState,
    Pagination
  ],

  templateUrl: './categorias.html',
  styleUrl: './categorias.scss'
})
export class Categorias implements OnInit {

  categorias:
    Categoria[] = [];

  search =
    '';

  tipoFiltro =
    'Todos';

  showFilters =
    false;

  currentPage =
    1;

  readonly itemsPerPage =
    8;

  showModal =
    false;

  showConfirmDialog =
    false;

  categoriaSelecionada:
    Categoria | null =
    null;

  nome =
    '';

  tipo:
    'receita' | 'despesa' =
    'receita';

  icone =
    'category';

  cor =
    '#3b82f6';

  orcamentoMensal =
    0;

  tipos = [
    'Todos',
    'Receita',
    'Despesa'
  ];

  tiposFormulario = [
    'receita',
    'despesa'
  ];

  icones = [
    'payments',
    'work',
    'trending_up',
    'restaurant',
    'home',
    'directions_car',
    'sports_esports',
    'medical_services',
    'category'
  ];

  constructor(
    private categoriaService:
      CategoriaService,

    private perfilService:
      PerfilFinanceiroService,

    private toast:
      ToastService
  ) {}

  ngOnInit(): void {

    this.carregarCategorias();

    this.perfilService
      .perfilAlterado$
      .subscribe(() => {

        this.currentPage =
          1;

        this.carregarCategorias();

      });

  }

  carregarCategorias():
    void {

    forkJoin({

      categorias:
        this.categoriaService
          .listar(),

      orcamentos:
        this.categoriaService
          .listarOrcamentos()

    }).subscribe({

      next: ({
        categorias,
        orcamentos
      }) => {

        const mapaOrcamentos =
          new Map(
            orcamentos.map(
              orcamento => [
                orcamento.categoriaId,
                orcamento
              ]
            )
          );

        this.categorias =
          categorias
            .filter(
              categoria =>
                categoria.ativa
            )
            .map(
              categoria => {

                const orcamento =
                  mapaOrcamentos.get(
                    String(
                      categoria.id
                    )
                  );

                if (
                  !orcamento
                ) {

                  return categoria;

                }

                return {

                  ...categoria,

                  orcamentoMensal:
                    orcamento.orcamentoMensal,

                  gastoTransacoes:
                    orcamento.gastoTransacoes,

                  gastoParcelas:
                    orcamento.gastoParcelas,

                  gastoMes:
                    orcamento.gastoMes,

                  restante:
                    orcamento.restante,

                  percentual:
                    orcamento.percentual,

                  statusOrcamento:
                    orcamento.status

                };

              }
            );

        this.ajustarPaginaAtual();

      },

      error: () => {

        this.toast.error(
          'Erro ao carregar categorias.'
        );

      }

    });

  }

  get categoriasFiltradas():
    Categoria[] {

    const busca =
      this.search
        .trim()
        .toLowerCase();

    return this.categorias
      .filter(
        categoria => {

          const combinaBusca =
            categoria.nome
              .toLowerCase()
              .includes(
                busca
              );

          const tipoFormatado =
            categoria.tipo ===
              'receita'
              ? 'Receita'
              : 'Despesa';

          const combinaTipo =
            this.tipoFiltro ===
              'Todos' ||
            this.tipoFiltro ===
              tipoFormatado;

          return (
            combinaBusca &&
            combinaTipo
          );

        }
      );

  }

  get categoriasPaginadas():
    Categoria[] {

    const inicio =
      (
        this.currentPage -
        1
      ) *
      this.itemsPerPage;

    return this.categoriasFiltradas
      .slice(
        inicio,
        inicio +
          this.itemsPerPage
      );

  }

  get totalPages():
    number {

    return Math.max(
      1,
      Math.ceil(
        this.categoriasFiltradas
          .length /
        this.itemsPerPage
      )
    );

  }

  get totalCategorias():
    string {

    return this.categoriasFiltradas
      .length
      .toString();

  }

  get totalReceitas():
    string {

    return this.categoriasFiltradas
      .filter(
        categoria =>
          categoria.tipo ===
          'receita'
      )
      .length
      .toString();

  }

  get totalDespesas():
    string {

    return this.categoriasFiltradas
      .filter(
        categoria =>
          categoria.tipo ===
          'despesa'
      )
      .length
      .toString();

  }

  get totalAtivas():
    string {

    return this.categoriasFiltradas
      .filter(
        categoria =>
          categoria.ativa
      )
      .length
      .toString();

  }

  aoAlterarFiltros():
    void {

    this.currentPage =
      1;

  }

  limparFiltros():
    void {

    this.search =
      '';

    this.tipoFiltro =
      'Todos';

    this.currentPage =
      1;

  }

  abrirNovaCategoria():
    void {

    this.categoriaSelecionada =
      null;

    this.nome =
      '';

    this.tipo =
      'receita';

    this.icone =
      'category';

    this.cor =
      '#3b82f6';

    this.orcamentoMensal =
      0;

    this.showModal =
      true;

  }

  editarCategoria(
    categoria:
      Categoria
  ): void {

    this.categoriaSelecionada =
      categoria;

    this.nome =
      categoria.nome;

    this.tipo =
      categoria.tipo;

    this.icone =
      categoria.icone;

    this.cor =
      categoria.cor;

    this.orcamentoMensal =
      categoria.orcamentoMensal ??
      0;

    this.showModal =
      true;

  }

  salvarCategoria():
    void {

    if (
      !this.nome
        .trim()
    ) {

      this.toast.warning(
        'Informe o nome da categoria.'
      );

      return;

    }

    if (
      this.tipo ===
        'despesa' &&
      this.orcamentoMensal <
        0
    ) {

      this.toast.warning(
        'O orçamento não pode ser negativo.'
      );

      return;

    }

    if (
      !this.corValida(
        this.cor
      )
    ) {

      this.toast.warning(
        'Informe uma cor válida no formato hexadecimal. Exemplo: #3b82f6.'
      );

      return;

    }

    this.cor =
      this.cor.toLowerCase();

    if (
      this.categoriaSelecionada
    ) {

      this.atualizarCategoria();

      return;

    }

    this.criarCategoria();

  }

  private atualizarCategoria():
    void {

    if (
      !this.categoriaSelecionada
    ) {

      return;

    }

    const categoriaAtualizada:
      Categoria = {

      ...this.categoriaSelecionada,

      nome:
        this.nome
          .trim(),

      tipo:
        this.tipo,

      icone:
        this.icone,

      cor:
        this.cor,

      orcamentoMensal:
        this.tipo ===
          'despesa'
          ? this.orcamentoMensal
          : undefined

    };

    this.categoriaService
      .editar(
        categoriaAtualizada
      )
      .subscribe({

        next:
          (
            ok:
              boolean
          ) => {

            if (
              !ok
            ) {

              this.toast.error(
                'Categoria não encontrada.'
              );

              return;

            }

            this.toast.success(
              'Categoria atualizada com sucesso.'
            );

            this.fecharModal();

            this.carregarCategorias();

          },

        error: () => {

          this.toast.error(
            'Erro ao atualizar categoria.'
          );

        }

      });

  }

  private criarCategoria():
    void {

    this.categoriaService
      .criar({

        nome:
          this.nome
            .trim(),

        tipo:
          this.tipo,

        icone:
          this.icone,

        cor:
          this.cor,

        ativa:
          true,

        orcamentoMensal:
          this.tipo ===
            'despesa'
            ? this.orcamentoMensal
            : undefined

      })
      .subscribe({

        next: () => {

          this.toast.success(
            'Categoria cadastrada com sucesso.'
          );

          this.fecharModal();

          this.carregarCategorias();

        },

        error: () => {

          this.toast.error(
            'Erro ao cadastrar categoria.'
          );

        }

      });

  }

  solicitarDesativacao(
    categoria:
      Categoria
  ): void {

    this.categoriaSelecionada =
      categoria;

    this.showConfirmDialog =
      true;

  }

  confirmarDesativacao():
    void {

    if (
      !this.categoriaSelecionada
    ) {

      return;

    }

    this.categoriaService
      .desativar(
        this.categoriaSelecionada.id
      )
      .subscribe({

        next:
          (
            ok:
              boolean
          ) => {

            if (
              !ok
            ) {

              this.toast.error(
                'Categoria não encontrada.'
              );

              return;

            }

            this.toast.info(
              'Categoria desativada com sucesso.'
            );

            this.showConfirmDialog =
              false;

            this.categoriaSelecionada =
              null;

            this.carregarCategorias();

          },

        error: () => {

          this.toast.error(
            'Erro ao desativar categoria.'
          );

        }

      });

  }

  cancelarDesativacao():
    void {

    this.showConfirmDialog =
      false;

    this.categoriaSelecionada =
      null;

  }

  fecharModal():
    void {

    this.showModal =
      false;

    this.categoriaSelecionada =
      null;

  }

  mudarPagina(
    page:
      number
  ): void {

    this.currentPage =
      page;

  }

  tipoLabel(
    tipo:
      Categoria['tipo']
  ): string {

    return tipo ===
      'receita'
      ? 'Receita'
      : 'Despesa';

  }

  tipoColor(
    tipo:
      Categoria['tipo']
  ): 'success' | 'danger' {

    return tipo ===
      'receita'
      ? 'success'
      : 'danger';

  }

  formatarMoeda(
    valor:
      number
  ): string {

    return valor.toLocaleString(
      'pt-BR',
      {
        style:
          'currency',

        currency:
          'BRL'
      }
    );

  }

  percentualBarra(
    percentual?:
      number
  ): number {

    return Math.min(
      percentual ??
        0,
      100
    );

  }

  statusOrcamentoLabel(
    categoria:
      Categoria
  ): string {

    switch (
      categoria.statusOrcamento
    ) {

      case 'NORMAL':

        return 'Dentro do orçamento';

      case 'ATENCAO':

        return 'Atenção';

      case 'EXCEDIDO':

        return 'Orçamento excedido';

      default:

        return 'Sem orçamento';

    }

  }

  statusOrcamentoClasse(
    categoria:
      Categoria
  ): string {

    switch (
      categoria.statusOrcamento
    ) {

      case 'NORMAL':

        return 'normal';

      case 'ATENCAO':

        return 'atencao';

      case 'EXCEDIDO':

        return 'excedido';

      default:

        return 'sem-orcamento';

    }

  }

  private corValida(
    cor:
      string
  ): boolean {

    return /^#[0-9A-Fa-f]{6}$/
      .test(
        cor
      );

  }

  private ajustarPaginaAtual():
    void {

    if (
      this.currentPage >
      this.totalPages
    ) {

      this.currentPage =
        this.totalPages;

    }

  }

}