import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { API_URL } from '../config/api.config';
import { SessaoApi } from '../models/api.model';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accessTokenKey = 'financa_facil_access_token';
  private readonly refreshTokenKey = 'financa_facil_refresh_token';
  private readonly usuarioKey = 'financa_facil_usuario';
  private readonly lembrarKey = 'financa_facil_lembrar';

  constructor(private readonly http: HttpClient) {}

  login(email: string, senha: string, lembrar = false): Observable<Usuario> {
    localStorage.removeItem('financa_facil_perfil_id');
    return this.http.post<SessaoApi>(`${API_URL}/auth/login`, { email, senha }).pipe(
      tap((sessao) => this.salvarSessao(sessao, lembrar)),
      map((sessao) => sessao.usuario)
    );
  }

  cadastrar(nome: string, email: string, senha: string): Observable<Usuario> {
    localStorage.removeItem('financa_facil_perfil_id');
    return this.http.post<SessaoApi>(`${API_URL}/auth/cadastro`, { nome, email, senha }).pipe(
      tap((sessao) => this.salvarSessao(sessao, true)),
      map((sessao) => sessao.usuario)
    );
  }

  esqueciSenha(email: string): Observable<{ message: string; tokenDesenvolvimento?: string }> {
    return this.http.post<{ message: string; tokenDesenvolvimento?: string }>(`${API_URL}/auth/esqueci-senha`, { email });
  }

  redefinirSenha(token: string, novaSenha: string): Observable<void> {
    return this.http.post<void>(`${API_URL}/auth/redefinir-senha`, { token, novaSenha });
  }

  alterarSenha(senhaAtual: string, novaSenha: string): Observable<boolean> {
    return this.http.patch<void>(`${API_URL}/auth/alterar-senha`, { senhaAtual, novaSenha }).pipe(map(() => true));
  }

  renovar(): Observable<boolean> {
    const refreshToken = this.obterRefreshToken();
    if (!refreshToken) return of(false);
    return this.http.post<SessaoApi>(`${API_URL}/auth/refresh`, { refreshToken }).pipe(
      tap((sessao) => this.salvarSessao(sessao, this.deveLembrar())),
      map(() => true),
      catchError(() => {
        this.limparSessao();
        return of(false);
      })
    );
  }

  logout(): void {
    const refreshToken = this.obterRefreshToken();
    this.limparSessao();
    localStorage.removeItem('financa_facil_perfil_id');
    if (refreshToken) {
      this.http.post<void>(`${API_URL}/auth/logout`, { refreshToken }).subscribe({ error: () => undefined });
    }
  }

  estaAutenticado(): boolean {
    const token = this.obterToken();
    if (!token) return false;
    try {
      const parte = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(parte.padEnd(Math.ceil(parte.length / 4) * 4, '='))) as { exp?: number };
      return Boolean(payload.exp && payload.exp * 1000 > Date.now());
    } catch {
      return false;
    }
  }

  obterToken(): string | null { return this.obterItem(this.accessTokenKey); }
  obterRefreshToken(): string | null { return this.obterItem(this.refreshTokenKey); }

  obterUsuario(): Usuario | null {
    const salvo = this.obterItem(this.usuarioKey);
    if (!salvo) return null;
    try { return JSON.parse(salvo) as Usuario; }
    catch { this.limparSessao(); return null; }
  }

  get usuario(): Usuario | null { return this.obterUsuario(); }

  atualizarUsuario(usuario: Usuario): void {
    this.storageAtual().setItem(this.usuarioKey, JSON.stringify(usuario));
  }

  alterarPerfilAtivo(perfil: Usuario['perfilAtivo']): void {
    const usuario = this.obterUsuario();
    if (usuario) this.atualizarUsuario({ ...usuario, perfilAtivo: perfil });
  }

  private salvarSessao(sessao: SessaoApi, lembrar: boolean): void {
    this.limparSessao();
    const storage = lembrar ? localStorage : sessionStorage;
    storage.setItem(this.accessTokenKey, sessao.accessToken);
    storage.setItem(this.refreshTokenKey, sessao.refreshToken);
    storage.setItem(this.usuarioKey, JSON.stringify({ ...sessao.usuario, perfilAtivo: 'pessoal' }));
    storage.setItem(this.lembrarKey, String(lembrar));
  }

  private limparSessao(): void {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem(this.accessTokenKey);
      storage.removeItem(this.refreshTokenKey);
      storage.removeItem(this.usuarioKey);
      storage.removeItem(this.lembrarKey);
    }
  }

  private obterItem(chave: string): string | null {
    return localStorage.getItem(chave) ?? sessionStorage.getItem(chave);
  }

  private deveLembrar(): boolean { return this.obterItem(this.lembrarKey) === 'true'; }
  private storageAtual(): Storage { return this.deveLembrar() ? localStorage : sessionStorage; }
}
