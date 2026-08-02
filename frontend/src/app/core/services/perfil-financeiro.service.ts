import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { PerfilFinanceiro } from '../models/perfil-financeiro.model';
import { PERFIS_FINANCEIROS_MOCK } from '../mock/perfis-financeiros.mock';

@Injectable({
  providedIn: 'root'
})
export class PerfilFinanceiroService {

  listar(): Observable<PerfilFinanceiro[]> {
    return of(
      PERFIS_FINANCEIROS_MOCK.map(
        (perfil) => ({ ...perfil })
      )
    );
  }

  criar(
    perfil: Omit<
      PerfilFinanceiro,
      'id' | 'dataCriacao'
    >
  ): Observable<PerfilFinanceiro> {
    if (perfil.ativo) {
      this.desativarTodos();
    }

    const novoPerfil: PerfilFinanceiro = {
      ...perfil,
      id: this.proximoId(),
      dataCriacao: this.obterDataAtual()
    };

    PERFIS_FINANCEIROS_MOCK.push(novoPerfil);

    return of({ ...novoPerfil });
  }

  editar(
    perfilAtualizado: PerfilFinanceiro
  ): Observable<boolean> {
    const indice = PERFIS_FINANCEIROS_MOCK.findIndex(
      (perfil: PerfilFinanceiro) =>
        perfil.id === perfilAtualizado.id
    );

    if (indice === -1) {
      return of(false);
    }

    if (perfilAtualizado.ativo) {
      this.desativarTodos();
    }

    PERFIS_FINANCEIROS_MOCK[indice] = {
      ...perfilAtualizado
    };

    return of(true);
  }

  excluir(id: number): Observable<boolean> {
    const indice = PERFIS_FINANCEIROS_MOCK.findIndex(
      (perfil: PerfilFinanceiro) =>
        perfil.id === id
    );

    if (indice === -1) {
      return of(false);
    }

    const perfilExcluido =
      PERFIS_FINANCEIROS_MOCK[indice];

    PERFIS_FINANCEIROS_MOCK.splice(
      indice,
      1
    );

    if (
      perfilExcluido.ativo &&
      PERFIS_FINANCEIROS_MOCK.length > 0
    ) {
      PERFIS_FINANCEIROS_MOCK[0].ativo = true;
    }

    return of(true);
  }

  ativar(id: number): Observable<boolean> {
    const perfilSelecionado =
      PERFIS_FINANCEIROS_MOCK.find(
        (perfil: PerfilFinanceiro) =>
          perfil.id === id
      );

    if (!perfilSelecionado) {
      return of(false);
    }

    this.desativarTodos();
    perfilSelecionado.ativo = true;

    return of(true);
  }

  buscarPerfilAtivo():
    Observable<PerfilFinanceiro | undefined> {
    const perfilAtivo =
      PERFIS_FINANCEIROS_MOCK.find(
        (perfil: PerfilFinanceiro) =>
          perfil.ativo
      );

    return of(
      perfilAtivo
        ? { ...perfilAtivo }
        : undefined
    );
  }

  private desativarTodos(): void {
    PERFIS_FINANCEIROS_MOCK.forEach(
      (perfil: PerfilFinanceiro) => {
        perfil.ativo = false;
      }
    );
  }

  private proximoId(): number {
    if (
      PERFIS_FINANCEIROS_MOCK.length === 0
    ) {
      return 1;
    }

    return (
      Math.max(
        ...PERFIS_FINANCEIROS_MOCK.map(
          (perfil: PerfilFinanceiro) =>
            perfil.id
        )
      ) + 1
    );
  }

  private obterDataAtual(): string {
    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(
      hoje.getMonth() + 1
    ).padStart(2, '0');

    const dia = String(
      hoje.getDate()
    ).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }
}