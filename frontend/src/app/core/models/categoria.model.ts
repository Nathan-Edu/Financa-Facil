export interface Categoria {
  id: string | number;
  nome: string;
  tipo: 'receita' | 'despesa';
  icone: string;
  cor: string;
  ativa: boolean;
  orcamentoMensal?: number;
}
