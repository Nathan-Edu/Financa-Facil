export interface Categoria {
  id: number;
  nome: string;
  tipo: 'receita' | 'despesa' | 'ambos';
  ativa: boolean;
}