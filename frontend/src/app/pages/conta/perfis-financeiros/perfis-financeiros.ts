import { Component, OnInit } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

import {
  PerfilFinanceiro,
  TipoPerfilFinanceiro
} from '../../../core/models/perfil-financeiro.model';

import {
  PerfilFinanceiroService
} from '../../../core/services/perfil-financeiro.service';

import {
  ToastService
} from '../../../shared/components/feedback/toast/toast.service';

import {
  StatCard
} from '../../../shared/components/display/stat-card/stat-card';

@Component({
  selector: 'app-perfis-financeiros',
  imports: [
    MatIconModule,
    StatCard
  ],
  templateUrl: './perfis-financeiros.html',
  styleUrl: './perfis-financeiros.scss'
})
export class PerfisFinanceiros implements OnInit {

  showModal = false;
  showConfirmDialog = false;

  perfilSelecionado: PerfilFinanceiro | null = null;

  search = '';
  filtroTipo = 'Todos';

  nome = '';
  tipo: TipoPerfilFinanceiro = 'pessoal';
  documento = '';
  descricao = '';
  cor = '#2563eb';
  icone = '';
  ativo = false;

  currentPage = 1;
  itemsPerPage = 4;

  tiposFiltro: string[] = [
    'Todos',
    'Pessoal',
    'Empresa'
  ];

  tiposFormulario: string[] = [
    'Pessoal',
    'Empresa'
  ];

  perfis: PerfilFinanceiro[] = [];

  constructor(
    private perfilService: PerfilFinanceiroService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.carregarPerfis();
  }

  carregarPerfis(): void {
    this.perfilService.listar().subscribe({
      next: (perfis: PerfilFinanceiro[]) => {
        this.perfis = perfis;
        this.ajustarPaginaAtual();
      },
      error: () => {
        this.toast.error(
          'Erro ao carregar os perfis financeiros.'
        );
      }
    });
  }

  get perfisFiltrados(): PerfilFinanceiro[] {
    const busca = this.search
      .trim()
      .toLowerCase();

    return this.perfis.filter((perfil) => {
      const combinaBusca =
        perfil.nome
          .toLowerCase()
          .includes(busca) ||
        perfil.documento
          .toLowerCase()
          .includes(busca) ||
        (perfil.descricao ?? '')
          .toLowerCase()
          .includes(busca);

      const combinaTipo =
        this.filtroTipo === 'Todos' ||
        perfil.tipo ===
          this.converterTipoFiltro(this.filtroTipo);

      return combinaBusca && combinaTipo;
    });
  }

  get perfisPaginados(): PerfilFinanceiro[] {
    const inicio =
      (this.currentPage - 1) * this.itemsPerPage;

    const fim = inicio + this.itemsPerPage;

    return this.perfisFiltrados.slice(
      inicio,
      fim
    );
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.perfisFiltrados.length /
        this.itemsPerPage
      )
    );
  }

  get quantidadePerfis(): string {
    return this.perfis.length.toString();
  }

  get quantidadePerfisAtivos(): string {
    return this.perfis
      .filter((perfil) => perfil.ativo)
      .length
      .toString();
  }

  get quantidadePessoais(): string {
    return this.contarPorTipo('pessoal').toString();
  }

  get quantidadeEmpresas(): string {
    return this.contarPorTipo('empresa').toString();
  }

  get resumoTotalPerfis(): string {
    const pessoais = this.contarPorTipo('pessoal');
    const empresas = this.contarPorTipo('empresa');

    return (
      `${pessoais} ${this.pluralizar(pessoais, 'pessoal', 'pessoais')}` +
      ` / ${empresas} ${this.pluralizar(empresas, 'empresa', 'empresas')}`
    );
  }

  private contarPorTipo(
    tipo: TipoPerfilFinanceiro
  ): number {
    return this.perfis.filter(
      (perfil) => perfil.tipo === tipo
    ).length;
  }

  private pluralizar(
    quantidade: number,
    singular: string,
    plural: string
  ): string {
    return quantidade === 1 ? singular : plural;
  }

  get tituloModal(): string {
    return this.perfilSelecionado
      ? 'Editar Perfil Financeiro'
      : 'Novo Perfil Financeiro';
  }

  get subtituloModal(): string {
    return this.perfilSelecionado
      ? 'Atualize os dados do perfil selecionado'
      : 'Cadastre uma nova conta pessoal ou empresarial';
  }

  get tituloConfirmacao(): string {
    return 'Excluir perfil financeiro';
  }

  get mensagemConfirmacao(): string {
    if (!this.perfilSelecionado) {
      return 'Deseja excluir este perfil financeiro?';
    }

    return `Deseja realmente excluir o perfil "${this.perfilSelecionado.nome}"?`;
  }

  abrirNovoPerfil(): void {
    this.perfilSelecionado = null;

    this.nome = '';
    this.tipo = 'pessoal';
    this.documento = '';
    this.descricao = '';
    this.cor = '#2563eb';
    this.icone = '';
    this.ativo = this.perfis.length === 0;

    this.showModal = true;
  }

  editarPerfil(
    perfil: PerfilFinanceiro
  ): void {
    this.perfilSelecionado = perfil;

    this.nome = perfil.nome;
    this.tipo = perfil.tipo;
    this.documento = perfil.documento;
    this.descricao = perfil.descricao ?? '';
    this.cor = perfil.cor;
    this.icone = perfil.icone;
    this.ativo = perfil.ativo;

    this.showModal = true;
  }

  salvarPerfil(): void {
    if (!this.nome.trim()) {
      this.toast.warning(
        'Informe o nome do perfil.'
      );
      return;
    }

    if (!this.documento.trim()) {
      this.toast.warning(
        this.tipo === 'pessoal'
          ? 'Informe o CPF.'
          : 'Informe o CNPJ.'
      );
      return;
    }

    if (!this.descricao.trim()) {
      this.toast.warning(
        'Informe uma descrição para o perfil.'
      );
      return;
    }

    if (this.perfilSelecionado) {
      this.atualizarPerfil();
      return;
    }

    this.criarPerfil();
  }

  private criarPerfil(): void {
    this.perfilService
      .criar({
        nome: this.nome.trim(),
        tipo: this.tipo,
        documento: this.documento.trim(),
        descricao:
          this.descricao.trim() || undefined,
        ativo: this.ativo,
        cor: this.cor,
        icone:
          this.icone.trim() ||
          this.gerarIniciais(this.nome)
      })
      .subscribe({
        next: () => {
          this.toast.success(
            'Perfil financeiro cadastrado com sucesso.'
          );

          this.fecharModal();
          this.carregarPerfis();
        },
        error: () => {
          this.toast.error(
            'Erro ao cadastrar o perfil financeiro.'
          );
        }
      });
  }

  private atualizarPerfil(): void {
    if (!this.perfilSelecionado) {
      return;
    }

    const perfilAtualizado: PerfilFinanceiro = {
      ...this.perfilSelecionado,
      nome: this.nome.trim(),
      tipo: this.tipo,
      documento: this.documento.trim(),
      descricao:
        this.descricao.trim() || undefined,
      ativo: this.ativo,
      cor: this.cor,
      icone:
        this.icone.trim() ||
        this.gerarIniciais(this.nome)
    };

    this.perfilService
      .editar(perfilAtualizado)
      .subscribe({
        next: (ok: boolean) => {
          if (!ok) {
            this.toast.error(
              'Perfil financeiro não encontrado.'
            );
            return;
          }

          this.toast.success(
            'Perfil financeiro atualizado com sucesso.'
          );

          this.fecharModal();
          this.carregarPerfis();
        },
        error: () => {
          this.toast.error(
            'Erro ao atualizar o perfil financeiro.'
          );
        }
      });
  }

  ativarPerfil(
    perfil: PerfilFinanceiro
  ): void {
    if (perfil.ativo) {
      return;
    }

    this.perfilService
      .ativar(perfil.id)
      .subscribe({
        next: (ok: boolean) => {
          if (!ok) {
            this.toast.error(
              'Perfil financeiro não encontrado.'
            );
            return;
          }

          this.toast.success(
            `O perfil "${perfil.nome}" está em uso.`
          );

          this.carregarPerfis();
        },
        error: () => {
          this.toast.error(
            'Erro ao ativar o perfil financeiro.'
          );
        }
      });
  }

  solicitarExclusao(
    perfil: PerfilFinanceiro
  ): void {
    this.perfilSelecionado = perfil;
    this.showConfirmDialog = true;
  }

  confirmarExclusao(): void {
    if (!this.perfilSelecionado) {
      return;
    }

    this.perfilService
      .excluir(this.perfilSelecionado.id)
      .subscribe({
        next: (ok: boolean) => {
          if (!ok) {
            this.toast.error(
              'Perfil financeiro não encontrado.'
            );
            return;
          }

          this.toast.success(
            'Perfil financeiro excluído com sucesso.'
          );

          this.showConfirmDialog = false;
          this.perfilSelecionado = null;

          this.carregarPerfis();
        },
        error: () => {
          this.toast.error(
            'Erro ao excluir o perfil financeiro.'
          );
        }
      });
  }

  cancelarExclusao(): void {
    this.showConfirmDialog = false;
    this.perfilSelecionado = null;
  }

  fecharModal(): void {
    this.showModal = false;
    this.perfilSelecionado = null;
  }

  mudarPagina(page: number): void {
    this.currentPage = page;
  }

  aplicarFiltroTipo(tipo: string): void {
    this.filtroTipo = tipo;
    this.currentPage = 1;
  }

  aoAlterarBusca(): void {
    this.currentPage = 1;
  }

  selecionarTipoFormulario(
    tipo: string
  ): void {
    this.tipo =
      tipo.toLowerCase() === 'empresa'
        ? 'empresa'
        : 'pessoal';
  }

  obterTipoPerfil(
    perfil: PerfilFinanceiro
  ): string {
    return perfil.tipo === 'pessoal'
      ? 'Pessoal'
      : 'Empresa';
  }

  obterDocumentoLabel(): string {
    return this.tipo === 'pessoal'
      ? 'CPF'
      : 'CNPJ';
  }

  obterDocumentoPlaceholder(): string {
    return this.tipo === 'pessoal'
      ? '000.000.000-00'
      : '00.000.000/0000-00';
  }

  obterIniciaisPerfil(
    perfil: PerfilFinanceiro
  ): string {
    if (perfil.icone?.trim()) {
      return perfil.icone.toUpperCase();
    }

    return this.gerarIniciais(perfil.nome);
  }

  private gerarIniciais(nome: string): string {
    const palavras = nome
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (palavras.length === 0) {
      return 'PF';
    }

    if (palavras.length === 1) {
      return palavras[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      palavras[0].charAt(0) +
      palavras[1].charAt(0)
    ).toUpperCase();
  }

  formatarData(data: string): string {
    if (!data) {
      return '';
    }

    if (data.includes('/')) {
      return data;
    }

    const partes = data.split('-');

    if (partes.length !== 3) {
      return data;
    }

    const [ano, mes, dia] = partes;

    return `${dia}/${mes}/${ano}`;
  }

  private converterTipoFiltro(
    tipo: string
  ): TipoPerfilFinanceiro {
    return tipo.toLowerCase() === 'empresa'
      ? 'empresa'
      : 'pessoal';
  }

  private ajustarPaginaAtual(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }
}