export interface Receita {
  id: number;
  descricao: string;
  categoria: string;
  valor: number;
  valorFormatado: string;
  data: string;
  observacao?: string;
}