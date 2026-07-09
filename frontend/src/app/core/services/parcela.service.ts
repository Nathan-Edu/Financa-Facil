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
}