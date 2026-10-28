import { HttpClient, HttpParams } from '@angular/common/http';

import { Injectable } from '@angular/core';

import {
  Observable,
  combineLatest,
  map
} from 'rxjs';

import { API_URL } from '../config/api.config';

import {
  DashboardResumo
} from '../models/dashboard.model';

import {
  ReceitaService
} from './receita.service';

import {
  DespesaService
} from './despesa.service';

import {
  ParcelaService
} from './parcela.service';

import {
  AlertaService
} from './alerta.service';

import {
  CategoriaService
} from './categoria.service';

import {
  PerfilFinanceiroService
} from './perfil-financeiro.service';

interface DashboardApi {

  periodo?: {
    inicio: string;
    fim: string;
  } | null;

  saldo: number;

  totalReceitas: number;

  totalDespesas: number;

  despesasNormais?: number;

  valorParcelasPeriodo?: number;

  totalParceladas: number;

  quantidadeParceladas?: number;

  proximoVencimento?: unknown;

}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private readonly http: HttpClient,
    private readonly perfis: PerfilFinanceiroService,
    private readonly receitaService: ReceitaService,
    private readonly despesaService: DespesaService,
    private readonly parcelaService: ParcelaService,
    private readonly alertaService: AlertaService,
    private readonly categoriaService: CategoriaService
  ) {}

  resumo(
    inicio?: string,
    fim?: string,
    todoPeriodo = false
  ): Observable<DashboardResumo> {

    const perfilId =
      this.perfis.obterPerfilAtivoId();

    let params =
      new HttpParams()
        .set(
          'perfilId',
          perfilId
        );

    if (
      todoPeriodo
    ) {

      params =
        params.set(
          'todoPeriodo',
          'true'
        );

    }

    if (
      inicio
    ) {

      params =
        params.set(
          'inicio',
          inicio
        );

    }

    if (
      fim
    ) {

      params =
        params.set(
          'fim',
          fim
        );

    }

    return combineLatest({

      dashboard:
        this.http.get<DashboardApi>(
          `${API_URL}/dashboard/resumo`,
          {
            params
          }
        ),

      receitas:
        this.receitaService.listar(),

      despesas:
        this.despesaService.listar(),

      parcelas:
        this.parcelaService.listar(),

      alertas:
        this.alertaService.listar(),

      categorias:
        this.categoriaService.listar()

    }).pipe(

      map(({
        dashboard,
        receitas,
        despesas,
        parcelas,
        alertas,
        categorias
      }): DashboardResumo => {

        const ultimasReceitas =
          receitas
            .filter(
              (receita) =>
                todoPeriodo ||
                this.estaNoPeriodo(
                  receita.data,
                  inicio,
                  fim
                )
            )
            .sort(
              (a, b) =>
                this.converterData(
                  b.data
                ).getTime() -
                this.converterData(
                  a.data
                ).getTime()
            )
            .slice(
              0,
              5
            );

        const ultimasDespesas =
          despesas
            .filter(
              (despesa) =>
                todoPeriodo ||
                this.estaNoPeriodo(
                  despesa.data,
                  inicio,
                  fim
                )
            )
            .sort(
              (a, b) =>
                this.converterData(
                  b.data
                ).getTime() -
                this.converterData(
                  a.data
                ).getTime()
            )
            .slice(
              0,
              5
            );

        const parcelasAtivas =
          parcelas.filter(
            (parcela) =>
              parcela.status === 'ativa'
          );

        const alertasPendentes =
          alertas
            .filter(
              (alerta) =>
                !alerta.visualizado &&
                !alerta.descartado
            )
            .slice(
              0,
              3
            );

        const categoriasAtivas =
          categorias.filter(
            (categoria) =>
              categoria.ativa
          );

        return {

          periodo:
            dashboard.periodo ?? undefined,

          saldo:
            dashboard.saldo,

          totalReceitas:
            dashboard.totalReceitas,

          totalDespesas:
            dashboard.totalDespesas,

          despesasNormais:
            dashboard.despesasNormais,

          valorParcelasPeriodo:
            dashboard.valorParcelasPeriodo,

          totalParceladas:
            dashboard.totalParceladas,

          quantidadeParceladas:
            dashboard.quantidadeParceladas,

          ultimasReceitas,

          ultimasDespesas,

          parcelasAtivas,

          alertas:
            alertasPendentes,

          categorias:
            categoriasAtivas

        };

      })

    );

  }

  private estaNoPeriodo(
    data: string,
    inicio?: string,
    fim?: string
  ): boolean {

    if (
      !inicio ||
      !fim
    ) {

      return true;

    }

    const dataRegistro =
      this.converterData(
        data
      );

    const dataInicio =
      this.converterData(
        inicio
      );

    const dataFim =
      this.converterData(
        fim
      );

    dataInicio.setHours(
      0,
      0,
      0,
      0
    );

    dataFim.setHours(
      23,
      59,
      59,
      999
    );

    return (
      dataRegistro >=
        dataInicio &&
      dataRegistro <=
        dataFim
    );

  }

  private converterData(
    data: string
  ): Date {

    if (
      data.includes('/')
    ) {

      const [
        dia,
        mes,
        ano
      ] =
        data
          .split('/')
          .map(Number);

      return new Date(
        ano,
        mes - 1,
        dia
      );

    }

    const [
      ano,
      mes,
      dia
    ] =
      data
        .slice(
          0,
          10
        )
        .split('-')
        .map(Number);

    return new Date(
      ano,
      mes - 1,
      dia
    );

  }

}