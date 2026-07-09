export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfilAtivo: 'pessoal' | 'empresa';
}