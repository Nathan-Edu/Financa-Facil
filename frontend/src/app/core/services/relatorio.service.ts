import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_URL } from '../config/api.config';
import { RelatorioFinanceiro } from '../models/relatorio.model';
import { PerfilFinanceiroService } from './perfil-financeiro.service';

interface RelatorioApi {
  resumo: { receitas: number; despesas: number; saldo: number };
  porCategoria: { categoria: string; tipo: 'RECEITA' | 'DESPESA'; total: number }[];
  evolucaoMensal: { mes: string; receitas: number; despesas: number }[];
  movimentacoes: { id: string; data: string; descricao: string; categoria: string; tipo: 'RECEITA' | 'DESPESA'; valor: number }[];
}

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  constructor(private readonly http: HttpClient, private readonly perfis: PerfilFinanceiroService) {}

  buscarRelatorio(perfilFinanceiroId: string | number, tipoPerfil: 'pessoal' | 'empresa' = 'pessoal'): Observable<RelatorioFinanceiro> {
    const fim = new Date().toISOString().slice(0, 10);
    const inicio = '1900-01-01';
    return this.http.get<RelatorioApi>(`${API_URL}/relatorios/financeiro`, {
      params: { perfilId: String(perfilFinanceiroId || this.perfis.obterPerfilAtivoId()), dataInicial: inicio, dataFinal: fim }
    }).pipe(map((api) => {
      const despesas = api.porCategoria.filter((item) => item.tipo === 'DESPESA');
      const receitas = api.porCategoria.filter((item) => item.tipo === 'RECEITA');
      const totalDespesas = despesas.reduce((soma, item) => soma + item.total, 0);
      const totalReceitas = receitas.reduce((soma, item) => soma + item.total, 0);
      return {
        perfilFinanceiroId,
        tipoPerfil,
        resumo: {
          totalReceitas: api.resumo.receitas,
          totalDespesas: api.resumo.despesas,
          saldo: api.resumo.saldo,
          percentualEconomia: api.resumo.receitas > 0 ? (api.resumo.saldo / api.resumo.receitas) * 100 : 0
        },
        evolucaoMensal: api.evolucaoMensal.map((item) => ({ ...item, saldo: item.receitas - item.despesas })),
        despesasPorCategoria: despesas.map((item) => ({ categoria: item.categoria, valor: item.total, percentual: totalDespesas ? item.total / totalDespesas * 100 : 0 })),
        receitasPorCategoria: receitas.map((item) => ({ categoria: item.categoria, valor: item.total, percentual: totalReceitas ? item.total / totalReceitas * 100 : 0 })),
        movimentacoes: api.movimentacoes.map((item) => ({
          ...item,
          perfilFinanceiroId,
          tipoPerfil,
          tipo: item.tipo === 'RECEITA' ? 'receita' : 'despesa'
        }))
      };
    }));
  }
}
