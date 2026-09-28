import { Receita } from './receita.model';
import { Despesa } from './despesa.model';
import { Parcela } from './parcela.model';
import { Alerta } from './alerta.model';
import { Categoria } from './categoria.model';


export interface DashboardPeriodo {

  inicio: string;

  fim: string;

}


export interface DashboardResumo {

  periodo?: DashboardPeriodo;

  saldo: number;

  totalReceitas: number;

  totalDespesas: number;

  despesasNormais?: number;

  valorParcelasPeriodo?: number;

  totalParceladas: number;

  quantidadeParceladas?: number;

  ultimasReceitas: Receita[];

  ultimasDespesas: Despesa[];

  parcelasAtivas: Parcela[];

  alertas: Alerta[];

  categorias: Categoria[];

}