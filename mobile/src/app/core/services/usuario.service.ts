import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Usuario } from '../models/usuario.model';
import { AuthService } from './auth.service';

interface UsuarioApi { id: string; nome: string; email: string; tipo: 'USUARIO' | 'ADMINISTRADOR'; }

export interface UsuarioAdministracao {
  id: string;
  nome: string;
  email: string;
  tipo: 'USUARIO' | 'ADMINISTRADOR';
  ativo: boolean;
  bloqueadoAte?: string | null;
  ultimoLoginEm?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ListaUsuariosApi {
  data: UsuarioAdministracao[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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

  listarUsuarios(): Observable<UsuarioAdministracao[]> {
  return this.http
    .get<ListaUsuariosApi>(
      `${API_URL}/usuarios`
    )
    .pipe(
      map((resposta) => resposta.data)
    );
}

alterarStatus(
  id: string,
  ativo: boolean
): Observable<UsuarioAdministracao> {

  return this.http.patch<UsuarioAdministracao>(
    `${API_URL}/usuarios/${id}/status`,
    { ativo }
  );
}

alterarTipo(
  id: string,
  tipo: 'USUARIO' | 'ADMINISTRADOR'
): Observable<UsuarioAdministracao> {

  return this.http.patch<UsuarioAdministracao>(
    `${API_URL}/usuarios/${id}/tipo`,
    { tipo }
  );
}
}
