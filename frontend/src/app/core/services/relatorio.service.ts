import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import {
  CategoriaRelatorio,
  EvolucaoMensalRelatorio,
  MovimentacaoRelatorio,
  RelatorioFinanceiro,
  ResumoRelatorio
} from '../models/relatorio.model';

import {
  MOVIMENTACOES_RELATORIO_MOCK
} from '../mock/relatorio.mock';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {

  /**
   * Retorna o relatório completo de um perfil financeiro.
   *
   * Futuramente este método poderá ser substituído
   * por uma chamada HTTP para a API.
   */
  buscarRelatorio(
    perfilFinanceiroId: number
  ): Observable<RelatorioFinanceiro> {

    const movimentacoes =
      MOVIMENTACOES_RELATORIO_MOCK
        .filter(
          movimentacao =>
            movimentacao.perfilFinanceiroId ===
            perfilFinanceiroId
        )
        .sort(
          (a, b) =>
            new Date(b.data).getTime() -
            new Date(a.data).getTime()
        );

    const tipoPerfil =
      movimentacoes[0]?.tipoPerfil ?? 'pessoal';

    const resumo =
      this.calcularResumo(movimentacoes);

    const evolucaoMensal =
      this.calcularEvolucaoMensal(
        movimentacoes
      );

    const despesasPorCategoria =
      this.calcularCategorias(
        movimentacoes,
        'despesa'
      );

    const receitasPorCategoria =
      this.calcularCategorias(
        movimentacoes,
        'receita'
      );

    const relatorio: RelatorioFinanceiro = {

      perfilFinanceiroId,

      tipoPerfil,

      resumo,

      evolucaoMensal,

      despesasPorCategoria,

      receitasPorCategoria,

      movimentacoes

    };

    return of(relatorio);
  }


  /**
   * Calcula os quatro indicadores principais.
   */
  private calcularResumo(
    movimentacoes: MovimentacaoRelatorio[]
  ): ResumoRelatorio {

    const totalReceitas =
      movimentacoes
        .filter(
          movimentacao =>
            movimentacao.tipo === 'receita'
        )
        .reduce(
          (total, movimentacao) =>
            total + movimentacao.valor,
          0
        );

    const totalDespesas =
      movimentacoes
        .filter(
          movimentacao =>
            movimentacao.tipo === 'despesa'
        )
        .reduce(
          (total, movimentacao) =>
            total + movimentacao.valor,
          0
        );

    const saldo =
      totalReceitas - totalDespesas;

    const percentualEconomia =
      totalReceitas > 0
        ? (saldo / totalReceitas) * 100
        : 0;

    return {

      totalReceitas,

      totalDespesas,

      saldo,

      percentualEconomia

    };
  }


  /**
   * Agrupa receitas e despesas por mês.
   */
  private calcularEvolucaoMensal(
    movimentacoes: MovimentacaoRelatorio[]
  ): EvolucaoMensalRelatorio[] {

    const meses = new Map<
      string,
      EvolucaoMensalRelatorio
    >();

    movimentacoes.forEach(
      movimentacao => {

        const data =
          new Date(
            `${movimentacao.data}T00:00:00`
          );

        const chave =
          `${data.getFullYear()}-${String(
            data.getMonth() + 1
          ).padStart(2, '0')}`;

        if (!meses.has(chave)) {

          meses.set(
            chave,
            {
              mes: chave,
              receitas: 0,
              despesas: 0,
              saldo: 0
            }
          );

        }

        const mes = meses.get(chave)!;

        if (
          movimentacao.tipo === 'receita'
        ) {

          mes.receitas +=
            movimentacao.valor;

        } else {

          mes.despesas +=
            movimentacao.valor;

        }

        mes.saldo =
          mes.receitas -
          mes.despesas;

      }
    );

    return Array.from(
      meses.values()
    ).sort(
      (a, b) =>
        a.mes.localeCompare(b.mes)
    );
  }


  /**
   * Agrupa movimentações por categoria.
   */
  private calcularCategorias(
    movimentacoes: MovimentacaoRelatorio[],
    tipo: 'receita' | 'despesa'
  ): CategoriaRelatorio[] {

    const categorias =
      new Map<string, number>();

    movimentacoes
      .filter(
        movimentacao =>
          movimentacao.tipo === tipo
      )
      .forEach(
        movimentacao => {

          const valorAtual =
            categorias.get(
              movimentacao.categoria
            ) ?? 0;

          categorias.set(
            movimentacao.categoria,
            valorAtual +
              movimentacao.valor
          );

        }
      );


    const total =
      Array.from(
        categorias.values()
      ).reduce(
        (soma, valor) =>
          soma + valor,
        0
      );


    return Array.from(
      categorias.entries()
    )
      .map(
        ([categoria, valor]) => ({

          categoria,

          valor,

          percentual:
            total > 0
              ? (valor / total) * 100
              : 0

        })
      )
      .sort(
        (a, b) =>
          b.valor - a.valor
      );
  }

}