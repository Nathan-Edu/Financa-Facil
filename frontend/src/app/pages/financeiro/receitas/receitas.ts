import { Component, OnInit } from '@angular/core';

import { Receita } from '../../../core/models/receita.model';
import { Categoria } from '../../../core/models/categoria.model';

import { ReceitaService } from '../../../core/services/receita.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { PerfilFinanceiroService } from '../../../core/services/perfil-financeiro.service';

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

  showFilters = false;

  receitaSelecionada:
    Receita | null = null;

  search = '';

  categoria = 'Todas';

  filtroPeriodo = 'Todo o período';

  dataInicialFiltro = '';

  dataFinalFiltro = '';

  readonly periodoOptions: string[] = [
    'Todo o período',
    'Este mês',
    'Mês anterior',
    'Últimos 3 meses',
    'Últimos 6 meses',
    'Este ano',
    'Personalizado'
  ];

  descricao = '';

  categoriaFormulario = '';

  valor = 0;

  data = '';

  observacao = '';

  recorrente = false;

  frequenciaRecorrencia:
    NonNullable<
      Receita['frequenciaRecorrencia']
    > = 'mensal';

  recorrenteAte = '';

  readonly frequenciasRecorrencia:
    SelectOption[] = [
      {
        label: 'Semanal',
        value: 'semanal'
      },
      {
        label: 'Mensal',
        value: 'mensal'
      },
      {
        label: 'Anual',
        value: 'anual'
      }
    ];

  currentPage = 1;

  readonly itemsPerPage = 8;

  categorias:
    string[] = [
      'Todas'
    ];

  categoriasFormulario:
    string[] = [];

  receitas:
    Receita[] = [];

  constructor(
    private receitaService:
      ReceitaService,

    private categoriaService:
      CategoriaService,

    private perfilService:
      PerfilFinanceiroService,

    private toast:
      ToastService
  ) {}

  ngOnInit(): void {

    this.carregarReceitas();

    this.carregarCategorias();

    this.perfilService
      .perfilAlterado$
      .subscribe(() => {

        this.currentPage = 1;

        this.carregarReceitas();

        this.carregarCategorias();

      });

  }

  carregarReceitas(): void {

    this.receitaService
      .listar()
      .subscribe({

        next:
          (
            receitas:
              Receita[]
          ) => {

            this.receitas =
              receitas;

          },

        error:
          () => {

            this.toast.error(
              'Erro ao carregar receitas.'
            );

          }

      });

  }

  carregarCategorias(): void {

    this.categoriaService
      .listar()
      .subscribe({

        next:
          (
            categorias:
              Categoria[]
          ) => {

            const categoriasReceita =
              categorias
                .filter(
                  categoria =>
                    categoria.ativa &&
                    categoria.tipo ===
                      'receita'
                )
                .map(
                  categoria =>
                    categoria.nome
                );

            this.categoriasFormulario =
              categoriasReceita;

            this.categorias = [
              'Todas',
              ...categoriasReceita
            ];

            if (
              !this.categoriaFormulario &&
              categoriasReceita.length >
                0
            ) {

              this.categoriaFormulario =
                categoriasReceita[0];

            }

          },

        error:
          () => {

            this.toast.error(
              'Erro ao carregar categorias de receitas.'
            );

          }

      });

  }

  get receitasFiltradas():
    Receita[] {

    const busca =
      this.search
        .trim()
        .toLowerCase();

    return this.receitas
      .filter(
        receita => {

          const combinaBusca =
            receita.descricao
              .toLowerCase()
              .includes(
                busca
              ) ||
            receita.categoria
              .toLowerCase()
              .includes(
                busca
              );

          const combinaCategoria =
            this.categoria ===
              'Todas' ||
            receita.categoria ===
              this.categoria;

          const combinaPeriodo =
            this.receitaNoPeriodo(
              receita
            );

          return (
            combinaBusca &&
            combinaCategoria &&
            combinaPeriodo
          );

        }
      );

  }

  private receitaNoPeriodo(
    receita:
      Receita
  ): boolean {

    if (
      this.filtroPeriodo ===
      'Todo o período'
    ) {

      return true;

    }

    const dataReceita =
      this.converterData(
        receita.data
      );

    const hoje =
      new Date();

    hoje.setHours(
      23,
      59,
      59,
      999
    );

    let inicio:
      Date | null =
      null;

    let fim:
      Date | null =
      hoje;

    switch (
      this.filtroPeriodo
    ) {

      case 'Este mês':

        inicio =
          new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            1
          );

        break;

      case 'Mês anterior':

        inicio =
          new Date(
            hoje.getFullYear(),
            hoje.getMonth() - 1,
            1
          );

        fim =
          new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            0,
            23,
            59,
            59,
            999
          );

        break;

      case 'Últimos 3 meses':

        inicio =
          new Date(
            hoje.getFullYear(),
            hoje.getMonth() - 2,
            1
          );

        break;

      case 'Últimos 6 meses':

        inicio =
          new Date(
            hoje.getFullYear(),
            hoje.getMonth() - 5,
            1
          );

        break;

      case 'Este ano':

        inicio =
          new Date(
            hoje.getFullYear(),
            0,
            1
          );

        break;

      case 'Personalizado': {

        if (
          this.dataInicialFiltro
        ) {

          const dataInicial =
            this.converterData(
              this.dataInicialFiltro
            );

          if (
            dataReceita <
            dataInicial
          ) {

            return false;

          }

        }

        if (
          this.dataFinalFiltro
        ) {

          const dataFinal =
            this.converterData(
              this.dataFinalFiltro
            );

          dataFinal.setHours(
            23,
            59,
            59,
            999
          );

          if (
            dataReceita >
            dataFinal
          ) {

            return false;

          }

        }

        return true;

      }

      default:

        return true;

    }

    return (
      (
        !inicio ||
        dataReceita >=
          inicio
      ) &&
      (
        !fim ||
        dataReceita <=
          fim
      )
    );

  }

  limparFiltros(): void {

    this.search = '';

    this.categoria =
      'Todas';

    this.filtroPeriodo =
      'Todo o período';

    this.dataInicialFiltro =
      '';

    this.dataFinalFiltro =
      '';

    this.currentPage =
      1;

  }

get totalRecebido(): string {

  const total =
    this.receitasFiltradas.reduce(
      (soma, receita) =>
        soma + receita.valor,
      0
    );

  return this.formatarMoeda(total);
}

  get receitasPaginadas():
    Receita[] {

    const inicio =
      (
        this.currentPage -
        1
      ) *
      this.itemsPerPage;

    return this.receitasFiltradas
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
        this.receitasFiltradas
          .length /
        this.itemsPerPage
      )
    );

  }

  get totalMesAtual(): string {

  const hoje =
    new Date();

  const total =
    this.receitasFiltradasSemPeriodo
      .filter(
        receita => {

          const dataReceita =
            this.converterData(
              receita.data
            );

          return (
            dataReceita.getMonth() ===
              hoje.getMonth() &&
            dataReceita.getFullYear() ===
              hoje.getFullYear()
          );

        }
      )
      .reduce(
        (soma, receita) =>
          soma + receita.valor,
        0
      );

  return this.formatarMoeda(
    total
  );

}

  get quantidadeReceitas(): string {

  return this.receitasFiltradas
    .length
    .toString();
}

  get tituloModal():
    string {

    return this.receitaSelecionada
      ? 'Editar Receita'
      : 'Nova Receita';

  }

  get subtituloModal():
    string {

    return this.receitaSelecionada
      ? 'Atualize os dados da receita'
      : 'Cadastre uma nova entrada financeira';

  }

  abrirNovaReceita(): void {

    this.receitaSelecionada =
      null;

    this.descricao = '';

    this.categoriaFormulario =
      this.categoriasFormulario[0] ??
      '';

    this.valor = 0;

    this.data = '';

    this.observacao = '';

    this.recorrente =
      false;

    this.frequenciaRecorrencia =
      'mensal';

    this.recorrenteAte =
      '';

    this.showModal =
      true;

  }

  editarReceita(
    receita:
      Receita
  ): void {

    this.receitaSelecionada =
      receita;

    this.descricao =
      receita.descricao;

    this.categoriaFormulario =
      receita.categoria;

    this.valor =
      receita.valor;

    this.data =
      receita.data;

    this.observacao =
      receita.observacao ??
      '';

    this.recorrente =
      receita.recorrente ??
      false;

    this.frequenciaRecorrencia =
      receita.frequenciaRecorrencia ??
      'mensal';

    this.recorrenteAte =
      receita.recorrenteAte ??
      '';

    this.showModal =
      true;

  }

  salvarReceita(): void {

    if (
      !this.descricao.trim()
    ) {

      this.toast.warning(
        'Informe a descrição da receita.'
      );

      return;

    }

    if (
      !this.categoriaFormulario
    ) {

      this.toast.warning(
        'Selecione uma categoria.'
      );

      return;

    }

    if (
      this.valor <=
      0
    ) {

      this.toast.warning(
        'Informe um valor maior que zero.'
      );

      return;

    }

    if (
      !this.data
    ) {

      this.toast.warning(
        'Informe a data da receita.'
      );

      return;

    }

    if (
      this.recorrente &&
      this.recorrenteAte &&
      this.recorrenteAte <=
        this.data
    ) {

      this.toast.warning(
        'A data final da recorrência deve ser posterior à primeira receita.'
      );

      return;

    }

    if (
      !this.recorrenciaValida()
    ) {

      return;

    }

    if (
      this.receitaSelecionada
    ) {

      this.atualizarReceita();

      return;

    }

    this.criarReceita();

  }

  private criarReceita():
    void {

    this.receitaService
      .criar({

        descricao:
          this.descricao.trim(),

        categoria:
          this.categoriaFormulario,

        valor:
          this.valor,

        data:
          this.data,

        observacao:
          this.observacao
            .trim() ||
          undefined,

        recorrente:
          this.recorrente,

        frequenciaRecorrencia:
          this.recorrente
            ? this
                .frequenciaRecorrencia
            : undefined,

        recorrenteAte:
          this.recorrente
            ? this.recorrenteAte ||
              undefined
            : undefined

      })
      .subscribe({

        next:
          () => {

            this.toast.success(
              'Receita cadastrada com sucesso.'
            );

            this.fecharModal();

            this.carregarReceitas();

          },

        error:
          erro => {

            const mensagem =
              erro?.error?.message ||
              'Erro ao cadastrar receita.';

            this.toast.error(
              Array.isArray(
                mensagem
              )
                ? mensagem[0]
                : mensagem
            );

          }

      });

  }

  private atualizarReceita():
    void {

    if (
      !this.receitaSelecionada
    ) {

      return;

    }

    const receitaAtualizada:
      Receita = {

      ...this.receitaSelecionada,

      descricao:
        this.descricao.trim(),

      categoria:
        this.categoriaFormulario,

      valor:
        this.valor,

      data:
        this.data,

      observacao:
        this.observacao
          .trim() ||
        undefined,

      recorrente:
        this.recorrente,

      frequenciaRecorrencia:
        this.recorrente
          ? this
              .frequenciaRecorrencia
          : undefined,

      recorrenteAte:
        this.recorrente
          ? this.recorrenteAte ||
            undefined
          : undefined

    };

    this.receitaService
      .editar(
        receitaAtualizada
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

        error:
          () => {

            this.toast.error(
              'Erro ao atualizar receita.'
            );

          }

      });

  }

  solicitarExclusao(
    receita:
      Receita
  ): void {

    this.receitaSelecionada =
      receita;

    this.showConfirmDialog =
      true;

  }

  confirmarExclusao():
    void {

    if (
      !this.receitaSelecionada
    ) {

      return;

    }

    this.receitaService
      .excluir(
        this.receitaSelecionada.id
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
                'Receita não encontrada.'
              );

              return;

            }

            this.toast.success(
              'Receita excluída com sucesso.'
            );

            this.showConfirmDialog =
              false;

            this.receitaSelecionada =
              null;

            this.carregarReceitas();

          },

        error:
          () => {

            this.toast.error(
              'Erro ao excluir receita.'
            );

          }

      });

  }

  cancelarExclusao():
    void {

    this.showConfirmDialog =
      false;

    this.receitaSelecionada =
      null;

  }

  fecharModal():
    void {

    this.showModal =
      false;

    this.receitaSelecionada =
      null;

  }

  mudarPagina(
    page:
      number
  ): void {

    this.currentPage =
      page;

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

  buscarCategoria(
    nome:
      string
  ): Categoria | undefined {

    return this.categoriaService
      .buscarPorNome(
        nome
      );

  }

  private converterData(
    data:
      string
  ): Date {

    if (
      data.includes('/')
    ) {

      const [
        dia,
        mes,
        ano
      ] =
        data
          .split('/')
          .map(
            Number
          );

      return new Date(
        ano,
        mes - 1,
        dia
      );

    }

    const [
      ano,
      mes,
      dia
    ] =
      data
        .split('-')
        .map(
          Number
        );

    return new Date(
      ano,
      mes - 1,
      dia
    );

  }

  private recorrenciaValida():
    boolean {

    if (
      !this.recorrente ||
      !this.recorrenteAte
    ) {

      return true;

    }

    const inicio =
      this.converterData(
        this.data
      );

    const fim =
      this.converterData(
        this.recorrenteAte
      );

    let proxima:
      Date;

    switch (
      this.frequenciaRecorrencia
    ) {

      case 'semanal':

        proxima =
          new Date(
            inicio
          );

        proxima.setDate(
          proxima.getDate() +
          7
        );

        break;

      case 'anual':

        proxima =
          new Date(
            inicio
          );

        proxima.setFullYear(
          proxima.getFullYear() +
          1
        );

        break;

      case 'mensal':

      default:

        proxima =
          new Date(
            inicio
          );

        proxima.setMonth(
          proxima.getMonth() +
          1
        );

        break;

    }

    if (
      fim <
      proxima
    ) {

      const textoFrequencia =
        this.frequenciaRecorrencia ===
        'semanal'

          ? 'semanal'

          : this.frequenciaRecorrencia ===
              'anual'

            ? 'anual'

            : 'mensal';

      this.toast.warning(
        `Para uma recorrência ${textoFrequencia}, a data final deve permitir pelo menos uma próxima ocorrência.`
      );

      return false;

    }

    return true;

  }

  get receitasFiltradasSemPeriodo(): Receita[] {

  const busca =
    this.search
      .trim()
      .toLowerCase();

  return this.receitas.filter(
    receita => {

      const combinaBusca =
        receita.descricao
          .toLowerCase()
          .includes(busca) ||
        receita.categoria
          .toLowerCase()
          .includes(busca);

      const combinaCategoria =
        this.categoria === 'Todas' ||
        receita.categoria ===
          this.categoria;

      return (
        combinaBusca &&
        combinaCategoria
      );

    }
  );

}

}