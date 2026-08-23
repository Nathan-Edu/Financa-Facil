import { Receita } from '../models/receita.model';

export const RECEITAS_MOCK: Receita[] = [

  {
    id: 1,
    descricao: 'Trabalho',
    categoria: 'Salário',
    valor: 5000,
    valorFormatado: 'R$ 5.000,00',
    data: '01/01/2026',
    observacao: 'Salário mensal'
  },

  {
    id: 2,
    descricao: 'Freelance',
    categoria: 'Freelance',
    valor: 850,
    valorFormatado: 'R$ 850,00',
    data: '10/01/2026',
    observacao: 'Projeto Angular'
  },

  {
    id: 3,
    descricao: 'Investimentos',
    categoria: 'Investimentos',
    valor: 120.50,
    valorFormatado: 'R$ 120,50',
    data: '15/01/2026'
  }

];