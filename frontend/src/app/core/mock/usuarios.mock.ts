import { Usuario } from '../models/usuario.model';

export interface UsuarioMock extends Usuario {
  senha: string;
}

export const USUARIOS_MOCK: UsuarioMock[] = [
  {
    id: 1,
    nome: 'Administrador',
    email: 'admin@financafacil.com',
    senha: '123456',
    perfilAtivo: 'pessoal'
  },
  {
    id: 2,
    nome: 'Nathan Eduardo',
    email: 'nathan@financafacil.com',
    senha: '123456',
    perfilAtivo: 'empresa'
  }
];