import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Categoria } from '../models/categoria.model';
import { CATEGORIAS_MOCK } from '../mock/categorias.mock';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  listar(): Observable<Categoria[]> {
    return of(CATEGORIAS_MOCK);
  }

}