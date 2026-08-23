export type TipoPerfilFinanceiro =
  | 'pessoal'
  | 'empresa';

export interface PerfilFinanceiro {
  id: number;
  nome: string;
  tipo: TipoPerfilFinanceiro;
  documento: string;
  descricao?: string;
  ativo: boolean;
  cor: string;
  icone: string;
  dataCriacao: string;
}