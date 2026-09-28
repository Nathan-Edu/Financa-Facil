import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';

import { API_URL } from '../config/api.config';
import { PaginaApi } from '../models/api.model';
import { Parcela } from '../models/parcela.model';
import { CategoriaService } from './categoria.service';
import { PerfilFinanceiroService } from './perfil-financeiro.service';
import { Despesa } from '../models/despesa.model';

interface ItemParcelaApi {

  id: string;

  numero: number;

  valor: number;

  dataVencimento: string;

  status:
    | 'PENDENTE'
    | 'PAGA'
    | 'VENCIDA'
    | 'CANCELADA';

}
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

  private converterData(
  data: string
): Date {

  const [
    ano,
    mes,
    dia
  ] =
    data
      .slice(0, 10)
      .split('-')
      .map(Number);

  return new Date(
    ano,
    mes - 1,
    dia
  );

}

  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

listarDespesasPeriodo(
  dataInicial?: string,
  dataFinal?: string
): Observable<Despesa[]> {

  return this.http
    .get<PaginaApi<ContaApi>>(
      `${API_URL}/contas-parceladas`,
      {
        params: {
          perfilId:
            this.perfis.obterPerfilAtivoId(),

          limit:
            100
        }
      }
    )
    .pipe(

      map((pagina) => {

        const despesasParceladas:
          Despesa[] = [];

        const inicio =
          dataInicial
            ? this.converterData(
                dataInicial
              )
            : null;

        const fim =
          dataFinal
            ? this.converterData(
                dataFinal
              )
            : null;

        if (fim) {

          fim.setHours(
            23,
            59,
            59,
            999
          );

        }

        for (
          const conta
          of pagina.data
        ) {

          if (
            conta.status ===
            'CANCELADA'
          ) {
            continue;
          }

          for (
            const parcela
            of conta.parcelas
          ) {

            if (
              parcela.status ===
              'CANCELADA'
            ) {
              continue;
            }

            const dataParcela =
              this.converterData(
                parcela.dataVencimento
              );

            if (
              inicio &&
              dataParcela <
                inicio
            ) {
              continue;
            }

            if (
              fim &&
              dataParcela >
                fim
            ) {
              continue;
            }

            despesasParceladas.push({

              id:
                `parcela-${parcela.id}`,

              parcelaId:
                parcela.id,

              descricao:
                `${conta.descricao} - Parcela ${parcela.numero}/${conta.quantidadeParcelas}`,

              categoria:
                conta.categoria.nome,

              valor:
                parcela.valor,

              valorFormatado:
                this.formatarMoeda(
                  parcela.valor
                ),

              data:
                parcela.dataVencimento
                  .slice(
                    0,
                    10
                  ),

              observacao:
                conta.observacao,

              origem:
                'parcelada',

              statusParcela:
                parcela.status

            });

          }

        }

        return despesasParceladas;

      })

    );

}
listarDespesasMesAtual():
  Observable<Despesa[]> {

  const hoje =
    new Date();

  const primeiroDia =
    new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      1
    );

  const ultimoDia =
    new Date(
      hoje.getFullYear(),
      hoje.getMonth() + 1,
      0
    );

  const formatarData =
    (
      data: Date
    ): string => {

      const ano =
        data.getFullYear();

      const mes =
        String(
          data.getMonth() + 1
        ).padStart(
          2,
          '0'
        );

      const dia =
        String(
          data.getDate()
        ).padStart(
          2,
          '0'
        );

      return `${ano}-${mes}-${dia}`;

    };

  return this.listarDespesasPeriodo(
    formatarData(
      primeiroDia
    ),

    formatarData(
      ultimoDia
    )
  );

}
}
