import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Despesa } from '../models/despesa.model';
import { DESPESAS_MOCK } from '../mock/despesas.mock';

@Injectable({
  providedIn: 'root'
})
export class DespesaService {
  listar(): Observable<Despesa[]> {
    return of(DESPESAS_MOCK);
  }

  criar(
    despesa: Omit<Despesa, 'id' | 'valorFormatado'>
  ): Observable<Despesa> {
    const novaDespesa: Despesa = {
      ...despesa,
      id: this.proximoId(),
      valorFormatado: this.formatarMoeda(despesa.valor)
    };

    DESPESAS_MOCK.push(novaDespesa);

    return of(novaDespesa);
  }

  editar(despesaAtualizada: Despesa): Observable<boolean> {
    const indice = DESPESAS_MOCK.findIndex(
      (despesa) => despesa.id === despesaAtualizada.id
    );

    if (indice === -1) {
      return of(false);
    }

    DESPESAS_MOCK[indice] = {
      ...despesaAtualizada,
      valorFormatado: this.formatarMoeda(
        despesaAtualizada.valor
      )
    };

    return of(true);
  }

  excluir(id: number): Observable<boolean> {
    const indice = DESPESAS_MOCK.findIndex(
      (despesa) => despesa.id === id
    );

    if (indice === -1) {
      return of(false);
    }

    DESPESAS_MOCK.splice(indice, 1);

    return of(true);
  }

  private proximoId(): number {
    if (DESPESAS_MOCK.length === 0) {
      return 1;
    }

    return (
      Math.max(
        ...DESPESAS_MOCK.map(
          (despesa) => despesa.id
        )
      ) + 1
    );
  }

  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}