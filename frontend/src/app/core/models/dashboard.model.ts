import { Receita } from './receita.model';
import { Despesa } from './despesa.model';
import { Parcela } from './parcela.model';
import { Alerta } from './alerta.model';
import { Categoria } from './categoria.model';

export interface DashboardResumo {
  saldo: number;
  totalReceitas: number;
  totalDespesas: number;
  totalParceladas: number;

  ultimasReceitas: Receita[];
  ultimasDespesas: Despesa[];
  parcelasAtivas: Parcela[];
  alertas: Alerta[];
  categorias: Categoria[];
}