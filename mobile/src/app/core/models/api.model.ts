import { Usuario } from './usuario.model';

export interface SessaoApi {
  accessToken: string;
  refreshToken: string;
  usuario: Usuario;
}

export interface PaginaApi<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
