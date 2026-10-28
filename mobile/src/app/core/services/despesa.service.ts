import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';

import { API_URL } from '../config/api.config';
import { PaginaApi } from '../models/api.model';
import { Despesa } from '../models/despesa.model';
import { CategoriaService } from './categoria.service';
import { PerfilFinanceiroService } from './perfil-financeiro.service';

interface TransacaoApi {
  id: string; descricao: string; valor: number; dataCompetencia: string; observacao?: string;
  recorrente: boolean; frequenciaRecorrencia?: 'SEMANAL' | 'MENSAL' | 'ANUAL'; recorrenteAte?: string;
  categoria: { id: string; nome: string };
}

@Injectable({ providedIn: 'root' })
export class DespesaService {
  constructor(private readonly http: HttpClient, private readonly perfis: PerfilFinanceiroService, private readonly categorias: CategoriaService) {}

  listar(): Observable<Despesa[]> {
    return this.http.get<PaginaApi<TransacaoApi>>(`${API_URL}/transacoes`, {
      params: { perfilId: this.perfis.obterPerfilAtivoId(), tipo: 'DESPESA', status: 'PAGA', limit: 100 }
    }).pipe(map((pagina) => pagina.data.map((item) => this.mapear(item))));
  }

  criar(despesa: Omit<Despesa, 'id' | 'valorFormatado'>): Observable<Despesa> {
    return this.categorias.resolverId(despesa.categoria, 'despesa').pipe(
      switchMap((categoriaId) => this.http.post<TransacaoApi>(`${API_URL}/transacoes`, {
        perfilId: this.perfis.obterPerfilAtivoId(), categoriaId, tipo: 'DESPESA',
        descricao: despesa.descricao, valor: despesa.valor, dataCompetencia: despesa.data, observacao: despesa.observacao,
        recorrente: despesa.recorrente, frequenciaRecorrencia: despesa.frequenciaRecorrencia?.toUpperCase(),
        recorrenteAte: despesa.recorrenteAte || undefined
      })),
      switchMap((criada) => this.http.patch<TransacaoApi>(`${API_URL}/transacoes/${criada.id}/pagar`, {})),
      map((criada) => this.mapear(criada))
    );
  }

  editar(despesa: Despesa): Observable<boolean> {
    return this.categorias.resolverId(despesa.categoria, 'despesa').pipe(
      switchMap((categoriaId) => this.http.patch<TransacaoApi>(`${API_URL}/transacoes/${despesa.id}`, {
        categoriaId, descricao: despesa.descricao, valor: despesa.valor,
        dataCompetencia: despesa.data, observacao: despesa.observacao,
        recorrente: despesa.recorrente, frequenciaRecorrencia: despesa.frequenciaRecorrencia?.toUpperCase(),
        recorrenteAte: despesa.recorrente ? despesa.recorrenteAte || null : null
      })),
      map(() => true)
    );
  }

  excluir(id: string | number): Observable<boolean> {
    return this.http.delete<void>(`${API_URL}/transacoes/${id}`).pipe(map(() => true));
  }

  private mapear(item: TransacaoApi): Despesa {
    return {
      id: item.id, descricao: item.descricao, categoria: item.categoria.nome,
      valor: item.valor, valorFormatado: this.formatarMoeda(item.valor),
      data: item.dataCompetencia.slice(0, 10), observacao: item.observacao,
      recorrente: item.recorrente,
      frequenciaRecorrencia: item.frequenciaRecorrencia?.toLowerCase() as Despesa['frequenciaRecorrencia'],
      recorrenteAte: item.recorrenteAte?.slice(0, 10)
    };
  }

  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
