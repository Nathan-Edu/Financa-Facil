import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Receita } from '../models/receita.model';
import { RECEITAS_MOCK } from '../mock/receitas.mock';

@Injectable({
  providedIn: 'root'
})
export class ReceitaService {
  listar(): Observable<Receita[]> {
    return of(RECEITAS_MOCK);
  }

  criar(
    receita: Omit<
      Receita,
      'id' | 'valorFormatado'
    >
  ): Observable<Receita> {
    const novaReceita: Receita = {
      ...receita,
      id: this.proximoId(),
      valorFormatado: this.formatarMoeda(
        receita.valor
      )
    };

    RECEITAS_MOCK.push(novaReceita);

    return of(novaReceita);
  }

  editar(
    receitaAtualizada: Receita
  ): Observable<boolean> {
    const indice = RECEITAS_MOCK.findIndex(
      (receita) =>
        receita.id === receitaAtualizada.id
    );

    if (indice === -1) {
      return of(false);
    }

    RECEITAS_MOCK[indice] = {
      ...receitaAtualizada,
      valorFormatado: this.formatarMoeda(
        receitaAtualizada.valor
      )
    };

    return of(true);
  }

  excluir(id: number): Observable<boolean> {
    const indice = RECEITAS_MOCK.findIndex(
      (receita) => receita.id === id
    );

    if (indice === -1) {
      return of(false);
    }

    RECEITAS_MOCK.splice(indice, 1);

    return of(true);
  }

  private proximoId(): number {
    if (RECEITAS_MOCK.length === 0) {
      return 1;
    }

    return (
      Math.max(
        ...RECEITAS_MOCK.map(
          (receita) => receita.id
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