export interface Receita {
  id: string | number;
  descricao: string;
  categoria: string;
  valor: number;
  valorFormatado: string;
  data: string;
  observacao?: string;
  recorrente?: boolean;
  frequenciaRecorrencia?: 'semanal' | 'mensal' | 'anual';
  recorrenteAte?: string;
}
