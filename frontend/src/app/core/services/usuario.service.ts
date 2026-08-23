import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Usuario } from '../models/usuario.model';

import {
  USUARIOS_MOCK,
  UsuarioMock
} from '../mock/usuarios.mock';

import {
  AuthService
} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(
    private authService: AuthService
  ) {}

  buscarUsuarioAtual(): Observable<Usuario> {

    const usuarioAtual =
      this.obterUsuarioMock();

    return of(
      this.removerSenha(usuarioAtual)
    );
  }

  editar(
    usuarioAtualizado: Usuario
  ): Observable<boolean> {

    const usuarioAtual =
      this.obterUsuarioMock();

    if (
      usuarioAtual.id !==
      usuarioAtualizado.id
    ) {
      return of(false);
    }

    Object.assign(
      usuarioAtual,
      usuarioAtualizado
    );

    this.atualizarUsuarioAutenticado(
      usuarioAtual
    );

    return of(true);
  }

  alterarSenha(
    senhaAtual: string,
    novaSenha: string
  ): Observable<boolean> {

    const usuarioAtual =
      this.obterUsuarioMock();

    if (
      usuarioAtual.senha !== senhaAtual
    ) {
      return of(false);
    }

    usuarioAtual.senha = novaSenha;

    return of(true);
  }

  private obterUsuarioMock(): UsuarioMock {

    const usuarioLogado =
      this.authService.obterUsuario();

    if (!usuarioLogado) {
      throw new Error(
        'Usuário não autenticado.'
      );
    }

    const usuarioMock =
      USUARIOS_MOCK.find(
        usuario =>
          usuario.id === usuarioLogado.id
      );

    if (!usuarioMock) {
      throw new Error(
        'Usuário não encontrado.'
      );
    }

    return usuarioMock;
  }

  private atualizarUsuarioAutenticado(
    usuario: UsuarioMock
  ): void {

    const usuarioSemSenha =
      this.removerSenha(usuario);

    this.authService
      .atualizarUsuario(usuarioSemSenha);
  }

  private removerSenha(
    usuario: UsuarioMock
  ): Usuario {

    const {
      senha,
      ...dadosUsuario
    } = usuario;

    return dadosUsuario;
  }

}