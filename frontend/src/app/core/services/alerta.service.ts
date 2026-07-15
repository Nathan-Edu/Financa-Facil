import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ALERTAS_MOCK } from '../mock/alertas.mock';
import { Alerta } from '../models/alerta.model';

@Injectable({
  providedIn:'root'
})
export class AlertaService {

  listar(): Observable<Alerta[]>{

    return of(ALERTAS_MOCK);

  }

  marcarComoLido(id: number): Observable<boolean> {

  const alerta = ALERTAS_MOCK.find(a => a.id === id);

  if (!alerta) {
    return of(false);
  }

  alerta.visualizado = true;

  return of(true);

}

descartar(id: number): Observable<boolean> {

  const alerta = ALERTAS_MOCK.find(a => a.id === id);

  if (!alerta) {
    return of(false);
  }

  alerta.descartado = true;

  return of(true);

}



}