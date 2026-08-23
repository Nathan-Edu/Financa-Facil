export interface Alerta {

  id: number;

  titulo: string;

  descricao: string;

  data: string;

  tipo:
    | 'vencimento'
    | 'orcamento'
    | 'meta'
    | 'informativo';

  prioridade:
    | 'baixa'
    | 'media'
    | 'alta';

  visualizado: boolean;

  descartado: boolean;

}