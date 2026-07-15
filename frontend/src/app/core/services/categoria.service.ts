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

  criar(categoria: Omit<Categoria, 'id'>): Observable<Categoria> {
    const novaCategoria: Categoria = {
      ...categoria,
      id: this.proximoId()
    };

    CATEGORIAS_MOCK.push(novaCategoria);

    return of(novaCategoria);
  }

  editar(categoriaAtualizada: Categoria): Observable<boolean> {
    const indice = CATEGORIAS_MOCK.findIndex(
      (categoria) => categoria.id === categoriaAtualizada.id
    );

    if (indice === -1) {
      return of(false);
    }

    CATEGORIAS_MOCK[indice] = {
      ...categoriaAtualizada
    };

    return of(true);
  }

  desativar(id: number): Observable<boolean> {
    const categoria = CATEGORIAS_MOCK.find(
      (item) => item.id === id
    );

    if (!categoria) {
      return of(false);
    }

    categoria.ativa = false;

    return of(true);
  }

  private proximoId(): number {
    if (CATEGORIAS_MOCK.length === 0) {
      return 1;
    }

    return Math.max(
      ...CATEGORIAS_MOCK.map((categoria) => categoria.id)
    ) + 1;
  }
}