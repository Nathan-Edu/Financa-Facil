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

}