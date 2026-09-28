export interface Alerta {

  id: string | number;

  titulo: string;

  descricao: string;

  data: string;

  tipo:
    | 'vencimento'
    | 'orcamento'
    | 'informativo';

  prioridade:
    | 'baixa'
    | 'media'
    | 'alta';

  visualizado: boolean;

  descartado: boolean;

}
