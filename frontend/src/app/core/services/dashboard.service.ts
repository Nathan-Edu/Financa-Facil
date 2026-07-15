import { Injectable } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';

import { ReceitaService } from './receita.service';
import { DespesaService } from './despesa.service';
import { ParcelaService } from './parcela.service';
import { AlertaService } from './alerta.service';
import { CategoriaService } from './categoria.service';

import { DashboardResumo } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private receitaService: ReceitaService,
    private despesaService: DespesaService,
    private parcelaService: ParcelaService,
    private alertaService: AlertaService,
    private categoriaService: CategoriaService
  ) {}

  resumo(): Observable<DashboardResumo> {
    return combineLatest({
      receitas: this.receitaService.listar(),
      despesas: this.despesaService.listar(),
      parcelas: this.parcelaService.listar(),
      alertas: this.alertaService.listar(),
      categorias: this.categoriaService.listar()
    }).pipe(
      map(({
        receitas,
        despesas,
        parcelas,
        alertas,
        categorias
      }): DashboardResumo => {
        const totalReceitas = receitas.reduce(
          (soma, receita) => soma + receita.valor,
          0
        );

        const totalDespesas = despesas.reduce(
          (soma, despesa) => soma + despesa.valor,
          0
        );

        const totalParceladas = parcelas
          .filter((parcela) => parcela.status !== 'finalizada')
          .reduce((soma, parcela) => {
            const parcelasRestantes =
              parcela.totalParcelas - parcela.parcelasPagas;

            return soma +
              parcelasRestantes * parcela.valorParcela;
          }, 0);

        const saldo = totalReceitas - totalDespesas;

        const ultimasReceitas = [...receitas]
          .sort(
            (a, b) =>
              this.converterData(b.data).getTime() -
              this.converterData(a.data).getTime()
          )
          .slice(0, 5);

        const ultimasDespesas = [...despesas]
          .sort(
            (a, b) =>
              this.converterData(b.data).getTime() -
              this.converterData(a.data).getTime()
          )
          .slice(0, 5);

        const parcelasAtivas = parcelas.filter(
          (parcela) => parcela.status === 'ativa'
        );

        const alertasPendentes = alertas
          .filter(
            (alerta) =>
              !alerta.visualizado &&
              !alerta.descartado
          )
          .slice(0, 3);

        const categoriasAtivas = categorias.filter(
          (categoria) => categoria.ativa
        );

        return {
          saldo,
          totalReceitas,
          totalDespesas,
          totalParceladas,
          ultimasReceitas,
          ultimasDespesas,
          parcelasAtivas,
          alertas: alertasPendentes,
          categorias: categoriasAtivas
        };
      })
    );
  }

  private converterData(data: string): Date {
    if (data.includes('/')) {
      const [dia, mes, ano] = data.split('/').map(Number);

      return new Date(ano, mes - 1, dia);
    }

    const [ano, mes, dia] = data.split('-').map(Number);

    return new Date(ano, mes - 1, dia);
  }
}