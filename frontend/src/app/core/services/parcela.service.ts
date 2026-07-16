import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Parcela } from '../models/parcela.model';
import { PARCELAS_MOCK } from '../mock/parceladas.mock';

@Injectable({
  providedIn: 'root'
})
export class ParcelaService {
  listar(): Observable<Parcela[]> {
    return of(PARCELAS_MOCK);
  }

  criar(
    parcela: Omit<
      Parcela,
      | 'id'
      | 'valorTotalFormatado'
      | 'valorParcela'
      | 'valorParcelaFormatado'
      | 'percentualPago'
      | 'status'
    >
  ): Observable<Parcela> {
    const valorParcela =
      parcela.totalParcelas > 0
        ? parcela.valorTotal / parcela.totalParcelas
        : 0;

    const novaParcela: Parcela = {
      ...parcela,
      id: this.proximoId(),
      valorTotalFormatado: this.formatarMoeda(
        parcela.valorTotal
      ),
      valorParcela,
      valorParcelaFormatado: this.formatarMoeda(
        valorParcela
      ),
      percentualPago: this.calcularPercentual(
        parcela.parcelasPagas,
        parcela.totalParcelas
      ),
      status: this.calcularStatus(
        parcela.parcelasPagas,
        parcela.totalParcelas,
        parcela.dataVencimento
      )
    };

    PARCELAS_MOCK.push(novaParcela);

    return of(novaParcela);
  }

  editar(
    parcelaAtualizada: Parcela
  ): Observable<boolean> {
    const indice = PARCELAS_MOCK.findIndex(
      (parcela) =>
        parcela.id === parcelaAtualizada.id
    );

    if (indice === -1) {
      return of(false);
    }

    const totalParcelas = Math.max(
      1,
      parcelaAtualizada.totalParcelas
    );

    const parcelasPagas = Math.min(
      Math.max(0, parcelaAtualizada.parcelasPagas),
      totalParcelas
    );

    const valorParcela =
      parcelaAtualizada.valorTotal / totalParcelas;

    const status = this.calcularStatus(
      parcelasPagas,
      totalParcelas,
      parcelaAtualizada.dataVencimento
    );

    PARCELAS_MOCK[indice] = {
      ...parcelaAtualizada,
      totalParcelas,
      parcelasPagas,
      valorTotalFormatado: this.formatarMoeda(
        parcelaAtualizada.valorTotal
      ),
      valorParcela,
      valorParcelaFormatado: this.formatarMoeda(
        valorParcela
      ),
      percentualPago: this.calcularPercentual(
        parcelasPagas,
        totalParcelas
      ),
      status,
      dataVencimento:
        status === 'finalizada'
          ? 'Finalizada'
          : parcelaAtualizada.dataVencimento
    };

    return of(true);
  }

  excluir(id: number): Observable<boolean> {
    const indice = PARCELAS_MOCK.findIndex(
      (parcela) => parcela.id === id
    );

    if (indice === -1) {
      return of(false);
    }

    PARCELAS_MOCK.splice(indice, 1);

    return of(true);
  }

  pagar(id: number): Observable<boolean> {
    const parcela = PARCELAS_MOCK.find(
      (item) => item.id === id
    );

    if (
      !parcela ||
      parcela.status === 'finalizada'
    ) {
      return of(false);
    }

    parcela.parcelasPagas = Math.min(
      parcela.parcelasPagas + 1,
      parcela.totalParcelas
    );

    parcela.percentualPago =
      this.calcularPercentual(
        parcela.parcelasPagas,
        parcela.totalParcelas
      );

    if (
      parcela.parcelasPagas >=
      parcela.totalParcelas
    ) {
      parcela.status = 'finalizada';
      parcela.percentualPago = 100;
      parcela.dataVencimento = 'Finalizada';
    } else {
      parcela.status = 'ativa';
      parcela.dataVencimento =
        this.adicionarUmMes(
          parcela.dataVencimento
        );
    }

    return of(true);
  }

  private calcularPercentual(
    parcelasPagas: number,
    totalParcelas: number
  ): number {
    if (totalParcelas <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (parcelasPagas / totalParcelas) * 100
      )
    );
  }

  private calcularStatus(
    parcelasPagas: number,
    totalParcelas: number,
    dataVencimento: string
  ): Parcela['status'] {
    if (
      parcelasPagas >= totalParcelas
    ) {
      return 'finalizada';
    }

    if (
      dataVencimento &&
      dataVencimento !== 'Finalizada'
    ) {
      const vencimento =
        this.converterData(dataVencimento);

      const hoje = new Date();

      hoje.setHours(0, 0, 0, 0);
      vencimento.setHours(0, 0, 0, 0);

      if (vencimento < hoje) {
        return 'atrasada';
      }
    }

    return 'ativa';
  }

  private adicionarUmMes(
    data: string
  ): string {
    if (
      !data ||
      data === 'Finalizada'
    ) {
      return data;
    }

    const dataAtual =
      this.converterData(data);

    dataAtual.setMonth(
      dataAtual.getMonth() + 1
    );

    const ano = dataAtual.getFullYear();
    const mes = String(
      dataAtual.getMonth() + 1
    ).padStart(2, '0');
    const dia = String(
      dataAtual.getDate()
    ).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  private converterData(
    data: string
  ): Date {
    if (data.includes('/')) {
      const [dia, mes, ano] =
        data.split('/').map(Number);

      return new Date(
        ano,
        mes - 1,
        dia
      );
    }

    const [ano, mes, dia] =
      data.split('-').map(Number);

    return new Date(
      ano,
      mes - 1,
      dia
    );
  }

  private proximoId(): number {
    if (PARCELAS_MOCK.length === 0) {
      return 1;
    }

    return (
      Math.max(
        ...PARCELAS_MOCK.map(
          (parcela) => parcela.id
        )
      ) + 1
    );
  }

  private formatarMoeda(
    valor: number
  ): string {
    return valor.toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    );
  }
}