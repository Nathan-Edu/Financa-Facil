import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of, switchMap, tap } from 'rxjs';

import { API_URL } from '../config/api.config';
import { PerfilFinanceiro } from '../models/perfil-financeiro.model';

interface PerfilApi {
  id: string;
  nome: string;
  tipo: 'PESSOAL' | 'EMPRESARIAL';
  documento: string;
  descricao?: string;
  cor: string;
  icone?: string;
  ativo: boolean;
  selecionado: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class PerfilFinanceiroService {
  private readonly perfilKey = 'financa_facil_perfil_id';

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<PerfilFinanceiro[]> {
    return this.http.get<PerfilApi[]>(`${API_URL}/perfis`).pipe(
      tap((perfis) => {
        const selecionado = perfis.find((perfil) => perfil.selecionado) ?? perfis[0];
        if (selecionado) localStorage.setItem(this.perfilKey, selecionado.id);
        else localStorage.removeItem(this.perfilKey);
      }),
      map((perfis) => perfis.map((perfil) => this.mapear(perfil)))
    );
  }

  criar(perfil: Omit<PerfilFinanceiro, 'id' | 'dataCriacao'>): Observable<PerfilFinanceiro> {
    return this.http.post<PerfilApi>(`${API_URL}/perfis`, {
      nome: perfil.nome,
      tipo: perfil.tipo === 'pessoal' ? 'PESSOAL' : 'EMPRESARIAL',
      documento: perfil.documento,
      descricao: perfil.descricao,
      cor: perfil.cor,
      icone: perfil.icone
    }).pipe(
      switchMap((criado) => perfil.ativo
        ? this.http.patch<PerfilApi>(`${API_URL}/perfis/${criado.id}/ativar`, {}).pipe(map((ativado) => ativado))
        : of(criado)),
      tap((criado) => { if (criado.selecionado) localStorage.setItem(this.perfilKey, criado.id); }),
      map((criado) => this.mapear(criado))
    );
  }

  editar(perfil: PerfilFinanceiro): Observable<boolean> {
    return this.http.patch<PerfilApi>(`${API_URL}/perfis/${perfil.id}`, {
      nome: perfil.nome,
      tipo: perfil.tipo === 'pessoal' ? 'PESSOAL' : 'EMPRESARIAL',
      documento: perfil.documento,
      descricao: perfil.descricao,
      cor: perfil.cor,
      icone: perfil.icone
    }).pipe(
      switchMap(() => perfil.ativo ? this.ativar(perfil.id) : of(true)),
      map(() => true)
    );
  }

  excluir(id: string | number): Observable<boolean> {
    return this.http.delete<void>(`${API_URL}/perfis/${id}`).pipe(
      tap(() => { if (localStorage.getItem(this.perfilKey) === String(id)) localStorage.removeItem(this.perfilKey); }),
      map(() => true)
    );
  }

  ativar(id: string | number): Observable<boolean> {
    return this.http.patch<PerfilApi>(`${API_URL}/perfis/${id}/ativar`, {}).pipe(
      tap((perfil) => localStorage.setItem(this.perfilKey, perfil.id)),
      map(() => true)
    );
  }

  buscarPerfilAtivo(): Observable<PerfilFinanceiro | undefined> {
    return this.listar().pipe(map((perfis) => perfis.find((perfil) => perfil.ativo)));
  }

  obterPerfilAtivoId(): string {
    const id = localStorage.getItem(this.perfilKey);
    if (!id) throw new Error('Selecione ou cadastre um perfil financeiro.');
    return id;
  }

  limparPerfilAtivo(): void { localStorage.removeItem(this.perfilKey); }

  private mapear(perfil: PerfilApi): PerfilFinanceiro {
    return {
      id: perfil.id,
      nome: perfil.nome,
      tipo: perfil.tipo === 'PESSOAL' ? 'pessoal' : 'empresa',
      documento: perfil.documento,
      descricao: perfil.descricao,
      ativo: perfil.selecionado,
      cor: perfil.cor || '#2563eb',
      icone: perfil.icone || '',
      dataCriacao: perfil.createdAt.slice(0, 10)
    };
  }
}
