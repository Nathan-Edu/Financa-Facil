import { Parcela } from '../models/parcela.model';

export const PARCELAS_MOCK: Parcela[] = [
  {
    id: 1,
    descricao: 'Notebook Dell',
    categoria: 'Tecnologia',
    valorTotal: 2400,
    valorTotalFormatado: 'R$ 2.400',
    valorParcela: 200,
    valorParcelaFormatado: 'R$ 200',
    parcelasPagas: 4,
    totalParcelas: 12,
    percentualPago: 33,
    dataVencimento: '2024-02-15',
    status: 'ativa'
  },
  {
    id: 2,
    descricao: 'Sofá da Sala',
    categoria: 'Casa',
    valorTotal: 1800,
    valorTotalFormatado: 'R$ 1.800',
    valorParcela: 180,
    valorParcelaFormatado: 'R$ 180',
    parcelasPagas: 8,
    totalParcelas: 10,
    percentualPago: 80,
    dataVencimento: '2024-02-20',
    status: 'ativa'
  },
  {
    id: 3,
    descricao: 'Curso Online',
    categoria: 'Educação',
    valorTotal: 600,
    valorTotalFormatado: 'R$ 600',
    valorParcela: 100,
    valorParcelaFormatado: 'R$ 100',
    parcelasPagas: 6,
    totalParcelas: 6,
    percentualPago: 100,
    dataVencimento: 'Finalizada',
    status: 'finalizada'
  }
];