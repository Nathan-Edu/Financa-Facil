import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Usuario } from '../models/usuario.model';
import {
  USUARIOS_MOCK,
  UsuarioMock
} from '../mock/usuarios.mock';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private usuarioAtual: UsuarioMock =
    structuredClone(USUARIOS_MOCK[ 0 ]);

  buscarUsuarioAtual(): Observable<Usuario> {
    return of(
      this.removerSenha(this.usuarioAtual)
    );
  }

  editar(
    usuarioAtualizado: Usuario
  ): Observable<boolean> {
    if (
      usuarioAtualizado.id !==
      this.usuarioAtual.id
    ) {
      return of(false);
    }

    this.usuarioAtual = {
      ...this.usuarioAtual,
      ...usuarioAtualizado
    };

    return of(true);
  }

  alterarSenha(
    senhaAtual: string,
    novaSenha: string
  ): Observable<boolean> {
    if (
      this.usuarioAtual.senha !== senhaAtual
    ) {
      return of(false);
    }

    this.usuarioAtual.senha = novaSenha;

    return of(true);
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