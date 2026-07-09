import { Categoria } from '../models/categoria.model';

export const CATEGORIAS_MOCK: Categoria[] = [

  {
    id: 1,
    nome: 'Trabalho',
    tipo: 'receita',
    ativa: true
  },

  {
    id: 2,
    nome: 'Freelance',
    tipo: 'receita',
    ativa: true
  },

  {
    id: 3,
    nome: 'Alimentação',
    tipo: 'despesa',
    ativa: true
  },

  {
    id: 4,
    nome: 'Moradia',
    tipo: 'despesa',
    ativa: true
  },

  {
    id: 5,
    nome: 'Transporte',
    tipo: 'despesa',
    ativa: true
  },

  {
    id: 6,
    nome: 'Lazer',
    tipo: 'despesa',
    ativa: true
  }

];