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

}