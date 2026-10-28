import { Categoria } from '../models/categoria.model';

export const CATEGORIAS_MOCK: Categoria[] = [
  {
    id: 1,
    nome: 'Salário',
    tipo: 'receita',
    icone: 'payments',
    cor: '#22c55e',
    ativa: true
  },
  {
    id: 2,
    nome: 'Freelance',
    tipo: 'receita',
    icone: 'work',
    cor: '#10b981',
    ativa: true
  },
  {
    id: 3,
    nome: 'Investimentos',
    tipo: 'receita',
    icone: 'trending_up',
    cor: '#3b82f6',
    ativa: true
  },
  {
  id: 4,
  nome: 'Alimentação',
  tipo: 'despesa',
  icone: 'restaurant',
  cor: '#f97316',
  ativa: true,
  orcamentoMensal: 800
},
{
  id: 5,
  nome: 'Moradia',
  tipo: 'despesa',
  icone: 'home',
  cor: '#8b5cf6',
  ativa: true,
  orcamentoMensal: 1500
},
{
  id: 6,
  nome: 'Transporte',
  tipo: 'despesa',
  icone: 'directions_car',
  cor: '#06b6d4',
  ativa: true,
  orcamentoMensal: 500
},
  {
    id: 7,
    nome: 'Lazer',
    tipo: 'despesa',
    icone: 'sports_esports',
    cor: '#ec4899',
    ativa: true
  },
  {
    id: 8,
    nome: 'Saúde',
    tipo: 'despesa',
    icone: 'medical_services',
    cor: '#ef4444',
    ativa: true
  }
];