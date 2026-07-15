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

  pagar(id: number): Observable<boolean> {

    const parcela = PARCELAS_MOCK.find(p => p.id === id);

    if (!parcela) {
      return of(false);
    }

    if (parcela.status === 'finalizada') {
      return of(false);
    }

    parcela.parcelasPagas++;

    parcela.percentualPago = Math.round(
      (parcela.parcelasPagas / parcela.totalParcelas) * 100
    );

    if (parcela.parcelasPagas >= parcela.totalParcelas) {

      parcela.parcelasPagas = parcela.totalParcelas;
      parcela.percentualPago = 100;
      parcela.status = 'finalizada';
      parcela.dataVencimento = 'Finalizada';

    } else {

      parcela.dataVencimento = this.adicionarUmMes(
        parcela.dataVencimento
      );

    }

    return of(true);

  }

  private adicionarUmMes(data: string): string {

    const [ano, mes, dia] = data.split('-').map(Number);

    const novaData = new Date(ano, mes - 1, dia);

    novaData.setMonth(novaData.getMonth() + 1);

    const novoAno = novaData.getFullYear();
    const novoMes = String(novaData.getMonth() + 1).padStart(2, '0');
    const novoDia = String(novaData.getDate()).padStart(2, '0');

    return `${novoAno}-${novoMes}-${novoDia}`;

  }

}