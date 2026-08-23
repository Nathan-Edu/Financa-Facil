import {
  Component,
  OnInit
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatMenuModule
} from '@angular/material/menu';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  AuthService
} from '../../../../core/services/auth.service';

import {
  PerfilFinanceiroService
} from '../../../../core/services/perfil-financeiro.service';

import {
  Usuario
} from '../../../../core/models/usuario.model';

import {
  PerfilFinanceiro
} from '../../../../core/models/perfil-financeiro.model';

@Component({
  selector: 'app-settings-menu',

  imports: [
    MatIconModule,
    MatMenuModule,
    MatButtonModule
  ],

  templateUrl: './settings-menu.html',
  styleUrl: './settings-menu.scss'
})
export class SettingsMenu implements OnInit {

  usuario: Usuario | null = null;

  perfisFinanceiros: PerfilFinanceiro[] = [];

  perfilFinanceiroAtivo:
    PerfilFinanceiro | null = null;

  temaAtual = 'Dark';

  constructor(
    private readonly authService:
      AuthService,

    private readonly perfilFinanceiroService:
      PerfilFinanceiroService,

    private readonly router:
      Router
  ) {}

  ngOnInit(): void {
    this.carregarUsuario();
    this.carregarPerfisFinanceiros();
    this.carregarTemaAtual();
  }

  carregarPerfisFinanceiros(): void {

    this.perfilFinanceiroService
      .listar()
      .subscribe({
        next: (
          perfis: PerfilFinanceiro[]
        ) => {

          this.perfisFinanceiros =
            perfis;

          this.perfilFinanceiroAtivo =
            perfis.find(
              perfil =>
                perfil.ativo
            ) ?? null;
        }
      });
  }

  selecionarPerfil(
    perfil: PerfilFinanceiro
  ): void {

    if (perfil.ativo) {
      return;
    }

    this.perfilFinanceiroService
      .ativar(perfil.id)
      .subscribe({
        next: (sucesso: boolean) => {

          if (!sucesso) {
            return;
          }

          /*
           * Mantemos o perfilAtivo do usuário
           * sincronizado por enquanto.
           */
          this.authService
            .alterarPerfilAtivo(
              perfil.tipo
            );

          if (this.usuario) {

            this.usuario = {
              ...this.usuario,
              perfilAtivo: perfil.tipo
            };
          }

          this.carregarPerfisFinanceiros();
        }
      });
  }

  gerenciarPerfis(): void {

    this.router.navigate([
      '/perfis-financeiros'
    ]);
  }

  alterarTema(
    tema: string
  ): void {

    this.temaAtual = tema;

    document.body.classList.remove(
      'theme-dark',
      'theme-light',
      'theme-green',
      'theme-violet',
      'theme-orange',
      'theme-black-all'
    );

    document.body.classList.add(
      `theme-${tema.toLowerCase()}`
    );

    localStorage.setItem(
      'financa_facil_tema',
      tema
    );
  }

  abrirMinhaConta(): void {

    this.router.navigate([
      '/minha-conta'
    ]);
  }

  alterarSenha(): void {

    this.router.navigate([
      '/alterar-senha'
    ]);
  }

  sair(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);
  }

  private carregarUsuario(): void {

    this.usuario =
      this.authService.obterUsuario();
  }

  private carregarTemaAtual(): void {

    const temaSalvo =
      localStorage.getItem(
        'financa_facil_tema'
      );

    if (!temaSalvo) {
      return;
    }

    this.alterarTema(
      temaSalvo
    );
  }

  get iniciaisUsuario(): string {

    if (!this.usuario?.nome) {
      return '?';
    }

    const nomes =
      this.usuario.nome
        .trim()
        .split(' ');

    if (nomes.length === 1) {

      return nomes[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      nomes[0].charAt(0) +
      nomes[nomes.length - 1]
        .charAt(0)
    ).toUpperCase();
  }

  get nomePerfilAtual(): string {

    return (
      this.perfilFinanceiroAtivo
        ?.nome ??
      'Nenhum perfil'
    );
  }

  get classePerfil(): string {

    return (
      this.perfilFinanceiroAtivo
        ?.tipo ??
      'pessoal'
    );
  }

}