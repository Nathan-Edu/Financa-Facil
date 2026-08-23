export interface Usuario {
  id: string | number;
  nome: string;
  email: string;
  perfilAtivo: 'pessoal' | 'empresa';

  cpf?: string;
  cnpj?: string;

  avatar?: string;
  tipo?: 'USUARIO' | 'ADMINISTRADOR';
}
