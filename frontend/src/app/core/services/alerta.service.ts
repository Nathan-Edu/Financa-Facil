import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ALERTAS_MOCK } from '../mock/alertas.mock';
import { Alerta } from '../models/alerta.model';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {

  listar(): Observable<Alerta[]> {
    return of(ALERTAS_MOCK);
  }

  criar(alerta: Omit<Alerta, 'id'>): Observable<Alerta> {

    const novo: Alerta = {
      ...alerta,
      id: this.proximoId()
    };

    ALERTAS_MOCK.push(novo);

    return of(novo);
  }

  editar(alertaAtualizado: Alerta): Observable<boolean> {

    const indice = ALERTAS_MOCK.findIndex(
      alerta => alerta.id === alertaAtualizado.id
    );

    if (indice === -1) {
      return of(false);
    }

    ALERTAS_MOCK[indice] = {
      ...alertaAtualizado
    };

    return of(true);

  }

  marcarComoLido(id: number): Observable<boolean> {

    const alerta = ALERTAS_MOCK.find(
      alerta => alerta.id === id
    );

    if (!alerta) {
      return of(false);
    }

    alerta.visualizado = true;

    return of(true);

  }

  marcarComoNaoLido(id: number): Observable<boolean> {

    const alerta = ALERTAS_MOCK.find(
      alerta => alerta.id === id
    );

    if (!alerta) {
      return of(false);
    }

    alerta.visualizado = false;

    return of(true);

  }

  descartar(id: number): Observable<boolean> {

    const alerta = ALERTAS_MOCK.find(
      alerta => alerta.id === id
    );

    if (!alerta) {
      return of(false);
    }

    alerta.descartado = true;

    return of(true);

  }

  restaurar(id: number): Observable<boolean> {

    const alerta = ALERTAS_MOCK.find(
      alerta => alerta.id === id
    );

    if (!alerta) {
      return of(false);
    }

    alerta.descartado = false;

    return of(true);

  }

  excluir(id: number): Observable<boolean> {

    const indice = ALERTAS_MOCK.findIndex(
      alerta => alerta.id === id
    );

    if (indice === -1) {
      return of(false);
    }

    ALERTAS_MOCK.splice(indice, 1);

    return of(true);

  }

  private proximoId(): number {

    if (ALERTAS_MOCK.length === 0) {
      return 1;
    }

    return Math.max(
      ...ALERTAS_MOCK.map(alerta => alerta.id)
    ) + 1;

  }

}