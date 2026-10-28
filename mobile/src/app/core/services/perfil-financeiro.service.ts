import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  Observable,
  Subject,
  map,
  of,
  switchMap,
  tap
} from 'rxjs';

import { API_URL } from '../config/api.config';

import {
  PerfilFinanceiro
} from '../models/perfil-financeiro.model';


interface PerfilApi {

  id: string;

  nome: string;

  tipo:
    | 'PESSOAL'
    | 'EMPRESARIAL';

  documento: string;

  descricao?: string;

  cor: string;

  icone?: string;

  ativo: boolean;

  selecionado: boolean;

  createdAt: string;

}


@Injectable({
  providedIn: 'root'
})
export class PerfilFinanceiroService {

  private readonly perfilKey =
    'financa_facil_perfil_id';


  // =====================================================
  // EVENTO GLOBAL DE TROCA DE PERFIL ATIVO
  // =====================================================

  private readonly perfilAlteradoSubject =
    new Subject<string>();

  readonly perfilAlterado$ =
    this.perfilAlteradoSubject
      .asObservable();


  // =====================================================
  // EVENTO GLOBAL DE ATUALIZAÇÃO DA LISTA DE PERFIS
  // =====================================================

  private readonly perfisAtualizadosSubject =
    new Subject<void>();

  readonly perfisAtualizados$ =
    this.perfisAtualizadosSubject
      .asObservable();


  constructor(
    private readonly http:
      HttpClient
  ) {}


  // =====================================================
  // LISTAR PERFIS
  // =====================================================

  listar(): Observable<PerfilFinanceiro[]> {

    return this.http
      .get<PerfilApi[]>(
        `${API_URL}/perfis`
      )
      .pipe(

        tap((perfis) => {

          const selecionado =
            perfis.find(
              perfil =>
                perfil.selecionado
            ) ??
            perfis[0];


          if (selecionado) {

            localStorage.setItem(
              this.perfilKey,
              selecionado.id
            );

          } else {

            localStorage.removeItem(
              this.perfilKey
            );

          }

        }),


        map((perfis) =>

          perfis.map(
            perfil =>
              this.mapear(perfil)
          )

        )

      );

  }


  // =====================================================
  // CRIAR PERFIL
  // =====================================================

  criar(
    perfil: Omit<
      PerfilFinanceiro,
      'id' | 'dataCriacao'
    >
  ): Observable<PerfilFinanceiro> {

    return this.http
      .post<PerfilApi>(
        `${API_URL}/perfis`,
        {

          nome:
            perfil.nome,

          tipo:
            perfil.tipo === 'pessoal'
              ? 'PESSOAL'
              : 'EMPRESARIAL',

          documento:
            perfil.documento,

          descricao:
            perfil.descricao,

          cor:
            perfil.cor,

          icone:
            perfil.icone

        }
      )
      .pipe(

        switchMap(
          criado => {

            if (!perfil.ativo) {

              return of(criado);

            }


            return this.http
              .patch<PerfilApi>(
                `${API_URL}/perfis/${criado.id}/ativar`,
                {}
              );

          }
        ),


        tap((criado) => {

          // A lista de perfis mudou
          this.perfisAtualizadosSubject
            .next();


          if (
            criado.selecionado
          ) {

            localStorage.setItem(
              this.perfilKey,
              criado.id
            );

            // O perfil ativo também mudou
            this.perfilAlteradoSubject
              .next(
                criado.id
              );

          }

        }),


        map(
          criado =>
            this.mapear(criado)
        )

      );

  }


  // =====================================================
  // EDITAR PERFIL
  // =====================================================

  editar(
    perfil: PerfilFinanceiro
  ): Observable<boolean> {

    return this.http
      .patch<PerfilApi>(
        `${API_URL}/perfis/${perfil.id}`,
        {

          nome:
            perfil.nome,

          tipo:
            perfil.tipo === 'pessoal'
              ? 'PESSOAL'
              : 'EMPRESARIAL',

          documento:
            perfil.documento,

          descricao:
            perfil.descricao,

          cor:
            perfil.cor,

          icone:
            perfil.icone

        }
      )
      .pipe(

        switchMap(
          () =>

            perfil.ativo
              ? this.ativar(
                  perfil.id
                )
              : of(true)

        ),


        tap(() => {

          this.perfisAtualizadosSubject
            .next();

        }),


        map(() => true)

      );

  }


  // =====================================================
  // EXCLUIR PERFIL
  // =====================================================

  excluir(
    id: string | number
  ): Observable<boolean> {

    return this.http
      .delete<void>(
        `${API_URL}/perfis/${id}`
      )
      .pipe(

        tap(() => {

          if (
            localStorage.getItem(
              this.perfilKey
            ) ===
            String(id)
          ) {

            localStorage.removeItem(
              this.perfilKey
            );

          }


          this.perfisAtualizadosSubject
            .next();

        }),


        map(() => true)

      );

  }


  // =====================================================
  // ATIVAR PERFIL
  // =====================================================

  ativar(
    id: string | number
  ): Observable<boolean> {

    return this.http
      .patch<PerfilApi>(
        `${API_URL}/perfis/${id}/ativar`,
        {}
      )
      .pipe(

        tap((perfil) => {

          localStorage.setItem(
            this.perfilKey,
            perfil.id
          );


          this.perfilAlteradoSubject
            .next(
              perfil.id
            );


          this.perfisAtualizadosSubject
            .next();

        }),


        map(() => true)

      );

  }


  // =====================================================
  // BUSCAR PERFIL ATIVO
  // =====================================================

  buscarPerfilAtivo():
    Observable<
      PerfilFinanceiro | undefined
    > {

    return this.listar()
      .pipe(

        map(
          perfis =>
            perfis.find(
              perfil =>
                perfil.ativo
            )
        )

      );

  }


  // =====================================================
  // OBTER ID DO PERFIL ATIVO
  // =====================================================

  obterPerfilAtivoId():
    string {

    const id =
      localStorage.getItem(
        this.perfilKey
      );


    if (!id) {

      throw new Error(
        'Selecione ou cadastre um perfil financeiro.'
      );

    }


    return id;

  }


  // =====================================================
  // LIMPAR PERFIL ATIVO
  // =====================================================

  limparPerfilAtivo():
    void {

    localStorage.removeItem(
      this.perfilKey
    );

  }


  // =====================================================
  // MAPEAR API -> FRONTEND
  // =====================================================

  private mapear(
    perfil:
      PerfilApi
  ): PerfilFinanceiro {

    return {

      id:
        perfil.id,

      nome:
        perfil.nome,

      tipo:
        perfil.tipo === 'PESSOAL'
          ? 'pessoal'
          : 'empresa',

      documento:
        perfil.documento,

      descricao:
        perfil.descricao,

      ativo:
        perfil.selecionado,

      cor:
        perfil.cor ||
        '#2563eb',

      icone:
        perfil.icone ||
        '',

      dataCriacao:
        perfil.createdAt
          .slice(
            0,
            10
          )

    };

  }

}