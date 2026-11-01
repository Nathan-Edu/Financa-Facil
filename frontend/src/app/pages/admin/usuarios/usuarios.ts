import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  UsuarioAdministracao,
  UsuarioService
} from '../../../core/services/usuario.service';

import { PageHeader } from '../../../shared/components/layout/page-header/page-header';
import { Card } from '../../../shared/components/layout/card/card';
import { Button } from '../../../shared/components/forms/button/button';
import { SearchInput } from '../../../shared/components/forms/search-input/search-input';
import { StatCard } from '../../../shared/components/display/stat-card/stat-card';
import { EmptyState } from '../../../shared/components/feedback/empty-state/empty-state';

import { AuthService } from '../../../core/services/auth.service';



@Component({
  selector: 'app-usuarios',
  standalone: true,
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
  erro = '';

  constructor( private readonly usuarioService: UsuarioService,
  private readonly auth: AuthService) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  get usuariosFiltrados(): UsuarioAdministracao[] {
    const termo = this.busca.trim().toLowerCase();

    if (!termo) {
      return this.usuarios;
    }

    return this.usuarios.filter(
      (usuario) =>
        usuario.nome.toLowerCase().includes(termo) ||
        usuario.email.toLowerCase().includes(termo)
    );
  }

  carregarUsuarios(): void {
    this.carregando = true;
    this.erro = '';

    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar os usuários.';
        this.carregando = false;
      }
    });
  }

  alterarStatus(usuario: UsuarioAdministracao): void {
    this.usuarioService
      .alterarStatus(usuario.id, !usuario.ativo)
      .subscribe({
        next: (atualizado) => {
          usuario.ativo = atualizado.ativo;
        },
        error: () => {
          this.erro = 'Não foi possível alterar o status do usuário.';
        }
      });
  }

  alterarTipo(
    usuario: UsuarioAdministracao,
    tipo: 'USUARIO' | 'ADMINISTRADOR'
  ): void {
    if (usuario.tipo === tipo) {
      return;
    }

    this.usuarioService.alterarTipo(usuario.id, tipo).subscribe({
      next: (atualizado) => {
        usuario.tipo = atualizado.tipo;
      },
      error: () => {
        this.erro = 'Não foi possível alterar o tipo do usuário.';
      }
    });
  }
  get totalAdministradores(): string {
  return this.usuarios
    .filter(usuario => usuario.tipo === 'ADMINISTRADOR')
    .length
    .toString();
}

get totalAtivos(): string {
  return this.usuarios
    .filter(usuario => usuario.ativo)
    .length
    .toString();
}

get totalInativos(): string {
  return this.usuarios
    .filter(usuario => !usuario.ativo)
    .length
    .toString();
}

ehUsuarioAtual(usuario: UsuarioAdministracao): boolean {
  return this.auth.obterUsuario()?.id === usuario.id;
}

}