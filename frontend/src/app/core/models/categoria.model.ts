export type StatusOrcamento =
  | 'SEM_ORCAMENTO'
  | 'NORMAL'
  | 'ATENCAO'
  | 'EXCEDIDO';

export interface Categoria {

  id: string | number;

  nome: string;

  tipo: 'receita' | 'despesa';

  icone: string;

  cor: string;

  ativa: boolean;

  orcamentoMensal?: number;

  gastoTransacoes?: number;

  gastoParcelas?: number;

  gastoMes?: number;

  restante?: number;

  percentual?: number;

  statusOrcamento?: StatusOrcamento;

}

export interface OrcamentoCategoria {

  categoriaId: string;

  nome: string;

  icone: string;

  cor: string;

  orcamentoMensal: number;

  gastoTransacoes: number;

  gastoParcelas: number;

  gastoMes: number;

  restante: number;

  percentual: number;

  status:
    | 'SEM_ORCAMENTO'
    | 'NORMAL'
    | 'ATENCAO'
    | 'EXCEDIDO';

}