import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../../core/services/auth.service';
import { Usuario } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-settings-menu',
  imports: [
    MatIconModule,
    MatMenuModule,
    MatButtonModule
  ],
  templateUrl: './settings-menu.html',
  styleUrl: './settings-menu.scss',
})
export class SettingsMenu implements OnInit {
  usuario: Usuario | null = null;

  perfilAtual = 'Pessoal';
  temaAtual = 'Dark';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.carregarUsuario();
    this.carregarTemaAtual();
  }

  alterarPerfil(perfil: Usuario['perfilAtivo']): void {
    this.authService.alterarPerfilAtivo(perfil);

    this.perfilAtual =
      perfil === 'pessoal'
        ? 'Pessoal'
        : 'Empresa';

    if (this.usuario) {
      this.usuario = {
        ...this.usuario,
        perfilAtivo: perfil
      };
    }
  }

  alterarTema(tema: string): void {
    this.temaAtual = tema;

    document.body.classList.remove(
      'theme-dark',
      'theme-light',
      'theme-green',
      'theme-violet'
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
    this.router.navigate(['/minha-conta']);
  }

  alterarSenha(): void {
    console.log(
      'A página de alteração de senha ainda será implementada.'
    );
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private carregarUsuario(): void {
    this.usuario = this.authService.obterUsuario();

    if (!this.usuario) {
      return;
    }

    this.perfilAtual =
      this.usuario.perfilAtivo === 'pessoal'
        ? 'Pessoal'
        : 'Empresa';
  }

  private carregarTemaAtual(): void {
    const temaSalvo = localStorage.getItem(
      'financa_facil_tema'
    );

    if (!temaSalvo) {
      return;
    }

    this.alterarTema(temaSalvo);
  }
}