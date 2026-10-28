import { Despesa } from '../models/despesa.model';

export const DESPESAS_MOCK: Despesa[] = [

  {
    id: 1,
    descricao: 'Supermercado',
    categoria: 'Alimentação',
    valor: 285.50,
    valorFormatado: 'R$ 285,50',
    data: '02/01/2026'
  },

  {
    id: 2,
    descricao: 'Conta de Luz',
    categoria: 'Moradia',
    valor: 145.80,
    valorFormatado: 'R$ 145,80',
    data: '05/01/2026'
  },

  {
    id: 3,
    descricao: 'Combustível',
    categoria: 'Transporte',
    valor: 220,
    valorFormatado: 'R$ 220,00',
    data: '08/01/2026'
  }

];