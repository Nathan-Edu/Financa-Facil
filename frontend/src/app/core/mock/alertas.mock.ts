import { Alerta } from '../models/alerta.model';

export const ALERTAS_MOCK: Alerta[] = [

  {
    id:1,
    titulo:'Parcela do Notebook vence amanhã',
    descricao:'Parcela de R$ 200,00 vence em 15/02/2024.',
    data:'2024-02-14',
    tipo:'vencimento',
    prioridade:'alta',
    visualizado:false,
    descartado:false
  },

  {
    id:2,
    titulo:'Orçamento de Alimentação ultrapassado',
    descricao:'Você gastou R$ 850 de R$ 800 neste mês.',
    data:'2024-02-10',
    tipo:'orcamento',
    prioridade:'media',
    visualizado:false,
    descartado:false
  },

  {
    id:3,
    titulo:'Meta de economia atingida!',
    descricao:'Parabéns! Você economizou R$ 500 este mês.',
    data:'2024-02-08',
    tipo:'meta',
    prioridade:'baixa',
    visualizado:true,
    descartado:false
  },

  {
    id:4,
    titulo:'Parcela do Sofá vence em 3 dias',
    descricao:'Parcela de R$ 180,00 vence em 20/02/2024.',
    data:'2024-02-12',
    tipo:'vencimento',
    prioridade:'media',
    visualizado:true,
    descartado:false
  }

];