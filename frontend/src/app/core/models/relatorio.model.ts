export type TipoMovimentacaoRelatorio =
  | 'receita'
  | 'despesa';

export type TipoPerfilRelatorio =
  | 'pessoal'
  | 'empresa';

export interface MovimentacaoRelatorio {
  id: number;
  perfilFinanceiroId: number;
  tipoPerfil: TipoPerfilRelatorio;
  data: string;
  descricao: string;
  categoria: string;
  tipo: TipoMovimentacaoRelatorio;
  valor: number;
}

export interface ResumoRelatorio {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  percentualEconomia: number;
}

export interface EvolucaoMensalRelatorio {
  mes: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export interface CategoriaRelatorio {
  categoria: string;
  valor: number;
  percentual: number;
}

export interface RelatorioFinanceiro {
  perfilFinanceiroId: number;
  tipoPerfil: TipoPerfilRelatorio;
  resumo: ResumoRelatorio;
  evolucaoMensal: EvolucaoMensalRelatorio[];
  despesasPorCategoria: CategoriaRelatorio[];
  receitasPorCategoria: CategoriaRelatorio[];
  movimentacoes: MovimentacaoRelatorio[];
}