export interface Parcela {
  id: string | number;
  proximaParcelaId?: string;
  descricao: string;
  categoria: string;

  valorTotal: number;
  valorTotalFormatado: string;

  valorParcela: number;
  valorParcelaFormatado: string;

  parcelasPagas: number;
  totalParcelas: number;
  percentualPago: number;

  dataVencimento: string;
  status: 'ativa' | 'finalizada' | 'atrasada';

  observacao?: string;
}
