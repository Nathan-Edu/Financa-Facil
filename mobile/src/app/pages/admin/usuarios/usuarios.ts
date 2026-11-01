import { Component, OnInit } from '@angular/core';

import {
  UsuarioAdministracao,
  UsuarioService
} from '../../../core/services/usuario.service';

import { AuthService } from '../../../core/services/auth.service';

import { PageHeader } from '../../../shared/components/layout/page-header/page-header';
import { Card } from '../../../shared/components/layout/card/card';
import { Button } from '../../../shared/components/forms/button/button';
import { SearchInput } from '../../../shared/components/forms/search-input/search-input';
import { StatCard } from '../../../shared/components/display/stat-card/stat-card';
import { EmptyState } from '../../../shared/components/feedback/empty-state/empty-state';

@Component({
  selector: 'app-usuarios',

  imports: [
    PageHeader,
    Card,
    Button,
    SearchInput,
    StatCard,
    EmptyState
  ],

  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss'
})
export class Usuarios implements OnInit {

  usuarios: UsuarioAdministracao[] = [];

  busca = '';

  carregando = false;

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {

    this.carregando = true;

    this.usuarioService
      .listarUsuarios()
      .subscribe({

        next: (usuarios) => {

          this.usuarios =
            usuarios;

          this.carregando =
            false;

        },

        error: () => {

          this.carregando =
            false;

        }

      });

  }

  get usuariosFiltrados():
    UsuarioAdministracao[] {

    const termo =
      this.busca
        .trim()
        .toLowerCase();

    if (!termo) {
      return this.usuarios;
    }

    return this.usuarios.filter(
      (usuario) =>
        usuario.nome
          .toLowerCase()
          .includes(termo) ||
        usuario.email
          .toLowerCase()
          .includes(termo)
    );

  }

  get totalAdministradores():
    string {

    return this.usuarios
      .filter(
        (usuario) =>
          usuario.tipo ===
          'ADMINISTRADOR'
      )
      .length
      .toString();

  }

  get totalAtivos():
    string {

    return this.usuarios
      .filter(
        (usuario) =>
          usuario.ativo
      )
      .length
      .toString();

  }

  get totalInativos():
    string {

    return this.usuarios
      .filter(
        (usuario) =>
          !usuario.ativo
      )
      .length
      .toString();

  }

  ehUsuarioAtual(
    usuario: UsuarioAdministracao
  ): boolean {

    return (
      this.auth
        .obterUsuario()
        ?.id ===
      usuario.id
    );

  }

  alterarStatus(
    usuario: UsuarioAdministracao
  ): void {

    if (
      this.ehUsuarioAtual(usuario)
    ) {
      return;
    }

    const novoStatus =
      !usuario.ativo;

    this.usuarioService
      .alterarStatus(
        usuario.id,
        novoStatus
      )
      .subscribe({

        next: () => {

          usuario.ativo =
            novoStatus;

        }

      });

  }

  alterarTipo(
    usuario: UsuarioAdministracao,
    tipo:
      'USUARIO' |
      'ADMINISTRADOR'
  ): void {

    if (
      this.ehUsuarioAtual(usuario)
    ) {
      return;
    }

    if (
      usuario.tipo === tipo
    ) {
      return;
    }

    this.usuarioService
      .alterarTipo(
        usuario.id,
        tipo
      )
      .subscribe({

        next: () => {

          usuario.tipo =
            tipo;

        }

      });

  }

}