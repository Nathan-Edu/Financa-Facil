import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';

import { API_URL } from '../config/api.config';
import { PaginaApi } from '../models/api.model';
import { Parcela } from '../models/parcela.model';
import { CategoriaService } from './categoria.service';
import { PerfilFinanceiroService } from './perfil-financeiro.service';

interface ItemParcelaApi { id: string; valor: number; dataVencimento: string; status: 'PENDENTE' | 'PAGA' | 'VENCIDA' | 'CANCELADA'; }
interface ContaApi {
  id: string; descricao: string; valorTotal: number; quantidadeParcelas: number; parcelasPagas: number;
  percentualPago: number; proximoVencimento: string | null; status: 'ATIVA' | 'FINALIZADA' | 'CANCELADA';
  observacao?: string; categoria: { id: string; nome: string }; parcelas: ItemParcelaApi[];
}

@Injectable({ providedIn: 'root' })
export class ParcelaService {
  constructor(private readonly http: HttpClient, private readonly perfis: PerfilFinanceiroService, private readonly categorias: CategoriaService) {}

  listar(): Observable<Parcela[]> {
    return this.http.get<PaginaApi<ContaApi>>(`${API_URL}/contas-parceladas`, {
      params: { perfilId: this.perfis.obterPerfilAtivoId(), limit: 100 }
    }).pipe(map((pagina) => pagina.data.filter((conta) => conta.status !== 'CANCELADA').map((conta) => this.mapear(conta))));
  }

  criar(parcela: Omit<Parcela, 'id' | 'valorTotalFormatado' | 'valorParcela' | 'valorParcelaFormatado' | 'percentualPago' | 'status'>): Observable<Parcela> {
    const hoje = new Date().toISOString().slice(0, 10);
    const dataCompra = parcela.dataVencimento < hoje ? parcela.dataVencimento : hoje;
    return this.categorias.resolverId(parcela.categoria, 'despesa').pipe(
      switchMap((categoriaId) => this.http.post<ContaApi>(`${API_URL}/contas-parceladas`, {
        perfilId: this.perfis.obterPerfilAtivoId(), categoriaId, descricao: parcela.descricao,
        valorTotal: parcela.valorTotal, quantidadeParcelas: parcela.totalParcelas,
        dataCompra, primeiroVencimento: parcela.dataVencimento, observacao: parcela.observacao
      })),
      map((criada) => this.mapear(criada))
    );
  }

  editar(parcela: Parcela): Observable<boolean> {
    return this.categorias.resolverId(parcela.categoria, 'despesa').pipe(
      switchMap((categoriaId) => this.http.patch<ContaApi>(`${API_URL}/contas-parceladas/${parcela.id}`, {
        categoriaId, descricao: parcela.descricao, observacao: parcela.observacao
      })),
      map(() => true)
    );
  }

  excluir(id: string | number): Observable<boolean> {
    return this.http.patch(`${API_URL}/contas-parceladas/${id}/cancelar`, {}).pipe(map(() => true));
  }

  pagar(id: string | number): Observable<boolean> {
    return this.http.get<ContaApi>(`${API_URL}/contas-parceladas/${id}`).pipe(
      switchMap((conta) => {
        const proxima = conta.parcelas.find((item) => item.status === 'PENDENTE' || item.status === 'VENCIDA');
        if (!proxima) throw new Error('Não há parcela pendente.');
        return this.http.patch(`${API_URL}/parcelas/${proxima.id}/pagar`, {});
      }),
      map(() => true)
    );
  }

  private mapear(conta: ContaApi): Parcela {
    const proxima = conta.parcelas.find((item) => item.status === 'PENDENTE' || item.status === 'VENCIDA');
    const valorParcela = conta.quantidadeParcelas ? conta.valorTotal / conta.quantidadeParcelas : 0;
    const status: Parcela['status'] = conta.status === 'FINALIZADA' ? 'finalizada' : proxima?.status === 'VENCIDA' ? 'atrasada' : 'ativa';
    return {
      id: conta.id, proximaParcelaId: proxima?.id, descricao: conta.descricao, categoria: conta.categoria.nome,
      valorTotal: conta.valorTotal, valorTotalFormatado: this.formatarMoeda(conta.valorTotal),
      valorParcela, valorParcelaFormatado: this.formatarMoeda(valorParcela), parcelasPagas: conta.parcelasPagas,
      totalParcelas: conta.quantidadeParcelas, percentualPago: conta.percentualPago,
      dataVencimento: proxima?.dataVencimento.slice(0, 10) ?? 'Finalizada', status, observacao: conta.observacao
    };
  }

  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
