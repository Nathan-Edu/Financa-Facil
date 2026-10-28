import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Usuario } from '../models/usuario.model';
import { AuthService } from './auth.service';

interface UsuarioApi { id: string; nome: string; email: string; tipo: 'USUARIO' | 'ADMINISTRADOR'; }

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  constructor(private readonly http: HttpClient, private readonly auth: AuthService) {}

  buscarUsuarioAtual(): Observable<Usuario> {
    return this.http.get<UsuarioApi>(`${API_URL}/usuarios/me`).pipe(
      map((usuario) => this.mapear(usuario)),
      tap((usuario) => this.auth.atualizarUsuario(usuario))
    );
  }

  editar(usuario: Usuario): Observable<boolean> {
    return this.http.patch<UsuarioApi>(`${API_URL}/usuarios/me`, { nome: usuario.nome, email: usuario.email }).pipe(
      map((atualizado) => ({ ...this.mapear(atualizado), perfilAtivo: usuario.perfilAtivo, avatar: usuario.avatar })),
      tap((atualizado) => this.auth.atualizarUsuario(atualizado)),
      map(() => true)
    );
  }

  alterarSenha(senhaAtual: string, novaSenha: string): Observable<boolean> {
    return this.auth.alterarSenha(senhaAtual, novaSenha);
  }

  private mapear(usuario: UsuarioApi): Usuario {
    const atual = this.auth.obterUsuario();
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      perfilAtivo: atual?.perfilAtivo ?? 'pessoal',
      avatar: atual?.avatar
    };
  }
}
