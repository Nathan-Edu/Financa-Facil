import { HttpClient } from '@angular/common/http';

import { Injectable } from '@angular/core';

import {
  Observable,
  map,
  of,
  switchMap,
  tap,
  throwError
} from 'rxjs';

import { API_URL } from '../config/api.config';

import {
  Categoria,
  OrcamentoCategoria
} from '../models/categoria.model';

import {
  PerfilFinanceiroService
} from './perfil-financeiro.service';


interface CategoriaApi {

  id: string;

  nome: string;

  tipo:
    | 'RECEITA'
    | 'DESPESA'
    | 'AMBOS';

  icone: string;

  cor: string;

  ativa: boolean;

  orcamentoMensal?: number;

}


@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private cache: Categoria[] = [];


  constructor(
    private readonly http: HttpClient,
    private readonly perfis: PerfilFinanceiroService
  ) {}


  listar(): Observable<Categoria[]> {

    const perfilId =
      this.perfis.obterPerfilAtivoId();

    return this.http
      .get<CategoriaApi[]>(
        `${API_URL}/categorias`,
        {
          params: {
            perfilId
          }
        }
      )
      .pipe(

        map(
          (categorias) =>
            categorias.map(
              (categoria) =>
                this.mapear(categoria)
            )
        ),

        tap(
          (categorias) => {
            this.cache =
              categorias;
          }
        )

      );

  }


  listarOrcamentos():
    Observable<OrcamentoCategoria[]> {

    const perfilId =
      this.perfis.obterPerfilAtivoId();

    return this.http
      .get<OrcamentoCategoria[]>(
        `${API_URL}/categorias/orcamentos`,
        {
          params: {
            perfilId
          }
        }
      );

  }


  buscarPorNome(
    nome: string
  ): Categoria | undefined {

    return this.cache.find(
      (categoria) =>
        categoria.nome
          .trim()
          .toLowerCase() ===
        nome
          .trim()
          .toLowerCase()
    );

  }


  resolverId(
    nome: string,
    tipo: Categoria['tipo']
  ): Observable<string> {

    const encontrar = () =>
      this.cache.find(
        (categoria) =>
          categoria.nome
            .trim()
            .toLowerCase() ===
            nome
              .trim()
              .toLowerCase() &&

          categoria.tipo === tipo
      );


    const atual =
      encontrar();


    if (atual) {

      return of(
        String(atual.id)
      );

    }


    return this.listar().pipe(

      switchMap(() => {

        const categoria =
          encontrar();

        return categoria
          ? of(
              String(
                categoria.id
              )
            )
          : throwError(
              () =>
                new Error(
                  'Categoria não encontrada.'
                )
            );

      })

    );

  }


  criar(
    categoria: Omit<Categoria, 'id'>
  ): Observable<Categoria> {

    return this.http
      .post<CategoriaApi>(
        `${API_URL}/categorias`,
        {

          perfilId:
            this.perfis
              .obterPerfilAtivoId(),

          nome:
            categoria.nome,

          tipo:
            categoria.tipo
              .toUpperCase(),

          icone:
            categoria.icone,

          cor:
            categoria.cor,

          orcamentoMensal:
            categoria.orcamentoMensal

        }
      )
      .pipe(

        map(
          (criada) =>
            this.mapear(criada)
        )

      );

  }


  editar(
    categoria: Categoria
  ): Observable<boolean> {

    return this.http
      .patch<CategoriaApi>(
        `${API_URL}/categorias/${categoria.id}`,
        {

          nome:
            categoria.nome,

          tipo:
            categoria.tipo
              .toUpperCase(),

          icone:
            categoria.icone,

          cor:
            categoria.cor,

          orcamentoMensal:
            categoria.orcamentoMensal,

          ativa:
            categoria.ativa

        }
      )
      .pipe(
        map(() => true)
      );

  }


  desativar(
    id: string | number
  ): Observable<boolean> {

    return this.http
      .delete<void>(
        `${API_URL}/categorias/${id}`
      )
      .pipe(
        map(() => true)
      );

  }


  private mapear(
    categoria: CategoriaApi
  ): Categoria {

    return {

      id:
        categoria.id,

      nome:
        categoria.nome,

      tipo:
        categoria.tipo === 'RECEITA'
          ? 'receita'
          : 'despesa',

      icone:
        categoria.icone ||
        'category',

      cor:
        categoria.cor ||
        '#3b82f6',

      ativa:
        categoria.ativa,

      orcamentoMensal:
        categoria.orcamentoMensal

    };

  }

}