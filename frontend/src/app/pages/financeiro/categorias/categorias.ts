import { Component, OnInit } from '@angular/core';

import { Categoria } from '../../../core/models/categoria.model';
import { CategoriaService } from '../../../core/services/categoria.service';

import { ToastService } from '../../../shared/components/feedback/toast/toast.service';

import { PageHeader } from '../../../shared/components/layout/page-header/page-header';
import { Card } from '../../../shared/components/layout/card/card';

import { Button } from '../../../shared/components/forms/button/button';
import { SearchInput } from '../../../shared/components/forms/search-input/search-input';
import {
  Select,
  SelectOption
} from '../../../shared/components/forms/select/select';
import { CurrencyInput } from '../../../shared/components/forms/currency-input/currency-input';

import { StatCard } from '../../../shared/components/display/stat-card/stat-card';
import { Badge } from '../../../shared/components/display/badge/badge';

import { Modal } from '../../../shared/components/feedback/modal/modal';
import { ConfirmDialog } from '../../../shared/components/feedback/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/components/feedback/empty-state/empty-state';

import { Pagination } from '../../../shared/components/tables/pagination/pagination';

function hslParaHex(
  h: number,
  s: number,
  l: number
): string {
  l /= 100;

  const a = (s * Math.min(l, 1 - l)) / 100;

  const f = (n: number): string => {
    const k = (n + h / 30) % 12;

    const cor =
      l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

    return Math.round(255 * cor)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${f(0)}${f(8)}${f(4)}`;
}

function gerarCoresHex(
  quantidade: number,
  saturacao = 70,
  luminosidade = 55
): string[] {
  return Array.from(
    { length: quantidade },
    (_, indice) =>
      hslParaHex(
        Math.round((360 / quantidade) * indice),
        saturacao,
        luminosidade
      )
  );
}

function hexParaHsl(
  hex: string
): {
  h: number;
  s: number;
  l: number;
} {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  const luminosidade = (max + min) / 2;

  let matiz = 0;
  let saturacao = 0;

  if (max !== min) {
    const diferenca = max - min;

    saturacao =
      luminosidade > 0.5
        ? diferenca / (2 - max - min)
        : diferenca / (max + min);

    switch (max) {
      case r:
        matiz =
          (g - b) / diferenca +
          (g < b ? 6 : 0);
        break;

      case g:
        matiz =
          (b - r) / diferenca + 2;
        break;

      case b:
        matiz =
          (r - g) / diferenca + 4;
        break;
    }

    matiz *= 60;
  }

  return {
    h: Math.round(matiz),
    s: Math.round(saturacao * 100),
    l: Math.round(luminosidade * 100)
  };
}

const NOMES_POR_MATIZ: {
  max: number;
  nome: string;
}[] = [
  { max: 15, nome: 'Vermelho' },
  { max: 30, nome: 'Vermelho Alaranjado' },
  { max: 45, nome: 'Laranja' },
  { max: 60, nome: 'Âmbar' },
  { max: 75, nome: 'Amarelo' },
  { max: 90, nome: 'Amarelo Esverdeado' },
  { max: 105, nome: 'Verde Limão' },
  { max: 120, nome: 'Verde' },
  { max: 135, nome: 'Verde Esmeralda' },
  { max: 150, nome: 'Verde Água' },
  { max: 165, nome: 'Turquesa' },
  { max: 180, nome: 'Ciano' },
  { max: 195, nome: 'Azul Céu' },
  { max: 210, nome: 'Azul Celeste' },
  { max: 225, nome: 'Azul' },
  { max: 240, nome: 'Azul Royal' },
  { max: 255, nome: 'Índigo' },
  { max: 270, nome: 'Violeta' },
  { max: 285, nome: 'Roxo' },
  { max: 300, nome: 'Púrpura' },
  { max: 315, nome: 'Magenta' },
  { max: 330, nome: 'Rosa Choque' },
  { max: 345, nome: 'Rosa' },
  { max: 360, nome: 'Vermelho Rosado' }
];

function nomeDaCor(hex: string): string {
  const { h } = hexParaHsl(hex);

  const faixa = NOMES_POR_MATIZ.find(
    (item) => h <= item.max
  );

  return faixa?.nome ?? 'Vermelho';
}

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
  categorias: Categoria[] = [];

  search = '';
  tipoFiltro = 'Todos';

  currentPage = 1;
  totalPages = 1;

  showModal = false;
  showConfirmDialog = false;

  categoriaSelecionada: Categoria | null = null;

  nome = '';
  tipo: 'receita' | 'despesa' = 'receita';
  icone = 'category';
  cor = '#3b82f6';
  orcamentoMensal = 0;

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

  cores = gerarCoresHex(50);

  constructor(
    private categoriaService: CategoriaService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias = categorias.filter(
          (categoria) => categoria.ativa
        );
      },
      error: () => {
        this.toast.error(
          'Erro ao carregar categorias.'
        );
      }
    });
  }

  get categoriasFiltradas(): Categoria[] {
    const busca =
      this.search.trim().toLowerCase();

    return this.categorias.filter(
      (categoria) => {
        const combinaBusca =
          categoria.nome
            .toLowerCase()
            .includes(busca);

        const tipoFormatado =
          categoria.tipo === 'receita'
            ? 'Receita'
            : 'Despesa';

        const combinaTipo =
          this.tipoFiltro === 'Todos' ||
          this.tipoFiltro === tipoFormatado;

        return combinaBusca && combinaTipo;
      }
    );
  }

  get totalCategorias(): string {
    return this.categorias.length.toString();
  }

  get totalReceitas(): string {
    return this.categorias
      .filter(
        (categoria) =>
          categoria.tipo === 'receita'
      )
      .length
      .toString();
  }

  get totalDespesas(): string {
    return this.categorias
      .filter(
        (categoria) =>
          categoria.tipo === 'despesa'
      )
      .length
      .toString();
  }

  get totalAtivas(): string {
    return this.categorias
      .filter(
        (categoria) => categoria.ativa
      )
      .length
      .toString();
  }

  get coresOptions(): SelectOption[] {
    return this.cores.map(
      (cor) => ({
        label: this.nomeCor(cor),
        value: cor
      })
    );
  }

  abrirNovaCategoria(): void {
    this.categoriaSelecionada = null;

    this.nome = '';
    this.tipo = 'receita';
    this.icone = 'category';
    this.cor = '#3b82f6';
    this.orcamentoMensal = 0;

    this.showModal = true;
  }

  editarCategoria(
    categoria: Categoria
  ): void {
    this.categoriaSelecionada = categoria;

    this.nome = categoria.nome;
    this.tipo = categoria.tipo;
    this.icone = categoria.icone;
    this.cor = categoria.cor;
    this.orcamentoMensal =
      categoria.orcamentoMensal ?? 0;

    this.showModal = true;
  }

  salvarCategoria(): void {
    if (!this.nome.trim()) {
      this.toast.warning(
        'Informe o nome da categoria.'
      );

      return;
    }

    if (
      this.tipo === 'despesa' &&
      this.orcamentoMensal < 0
    ) {
      this.toast.warning(
        'O orçamento não pode ser negativo.'
      );

      return;
    }

    if (this.categoriaSelecionada) {
      this.atualizarCategoria();
      return;
    }

    this.criarCategoria();
  }

  private atualizarCategoria(): void {
    if (!this.categoriaSelecionada) {
      return;
    }

    const categoriaAtualizada: Categoria = {
      ...this.categoriaSelecionada,
      nome: this.nome.trim(),
      tipo: this.tipo,
      icone: this.icone,
      cor: this.cor,
      orcamentoMensal:
        this.tipo === 'despesa'
          ? this.orcamentoMensal
          : undefined
    };

    this.categoriaService
      .editar(categoriaAtualizada)
      .subscribe({
        next: (ok: boolean) => {
          if (!ok) {
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

  private criarCategoria(): void {
    this.categoriaService
      .criar({
        nome: this.nome.trim(),
        tipo: this.tipo,
        icone: this.icone,
        cor: this.cor,
        ativa: true,
        orcamentoMensal:
          this.tipo === 'despesa'
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
    categoria: Categoria
  ): void {
    this.categoriaSelecionada = categoria;
    this.showConfirmDialog = true;
  }

  confirmarDesativacao(): void {
    if (!this.categoriaSelecionada) {
      return;
    }

    this.categoriaService
      .desativar(
        this.categoriaSelecionada.id
      )
      .subscribe({
        next: (ok: boolean) => {
          if (!ok) {
            this.toast.error(
              'Categoria não encontrada.'
            );

            return;
          }

          this.toast.info(
            'Categoria desativada com sucesso.'
          );

          this.showConfirmDialog = false;
          this.categoriaSelecionada = null;

          this.carregarCategorias();
        },
        error: () => {
          this.toast.error(
            'Erro ao desativar categoria.'
          );
        }
      });
  }

  cancelarDesativacao(): void {
    this.showConfirmDialog = false;
    this.categoriaSelecionada = null;
  }

  fecharModal(): void {
    this.showModal = false;
    this.categoriaSelecionada = null;
  }

  mudarPagina(page: number): void {
    this.currentPage = page;
  }

  tipoLabel(
    tipo: Categoria['tipo']
  ): string {
    return tipo === 'receita'
      ? 'Receita'
      : 'Despesa';
  }

  tipoColor(
    tipo: Categoria['tipo']
  ): 'success' | 'danger' {
    return tipo === 'receita'
      ? 'success'
      : 'danger';
  }

  nomeCor(cor: string): string {
    return nomeDaCor(cor);
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
}