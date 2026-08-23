export interface Alerta {

  id: string | number;

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
