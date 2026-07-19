import { Injectable } from '@angular/core';

import { Usuario } from '../models/usuario.model';
import { USUARIOS_MOCK } from '../mock/usuarios.mock';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'financa_facil_token';
  private readonly usuarioKey = 'financa_facil_usuario';

login(email: string, senha: string): boolean {
  const usuarioEncontrado = USUARIOS_MOCK.find(
    usuario =>
      usuario.email.toLowerCase() === email.toLowerCase() &&
      usuario.senha === senha
  );

  if (!usuarioEncontrado) {
    return false;
  }

  const usuario: Usuario = {
    id: usuarioEncontrado.id,
    nome: usuarioEncontrado.nome,
    email: usuarioEncontrado.email,
    perfilAtivo: usuarioEncontrado.perfilAtivo
  };

  localStorage.setItem(
    this.tokenKey,
    `token-simulado-${usuario.id}`
  );

  localStorage.setItem(
    this.usuarioKey,
    JSON.stringify(usuario)
  );

  return true;
}

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usuarioKey);
  }

  estaAutenticado(): boolean {
    return Boolean(localStorage.getItem(this.tokenKey));
  }

  obterToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  obterUsuario(): Usuario | null {
    const usuarioSalvo = localStorage.getItem(this.usuarioKey);

    if (!usuarioSalvo) {
      return null;
    }

    try {
      return JSON.parse(usuarioSalvo) as Usuario;
    } catch {
      this.logout();
      return null;
    }
  }

  alterarPerfilAtivo(
  perfil: Usuario['perfilAtivo']
): void {
  const usuario = this.obterUsuario();

  if (!usuario) {
    return;
  }

  const usuarioAtualizado: Usuario = {
    ...usuario,
    perfilAtivo: perfil
  };

  localStorage.setItem(
    this.usuarioKey,
    JSON.stringify(usuarioAtualizado)
  );
}

}