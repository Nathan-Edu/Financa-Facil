import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../config/api.config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('autentica e persiste a sessão quando lembrar acesso está ativo', () => {
    service.login('ana@example.com', 'Senha@123', true).subscribe((usuario) => expect(usuario.nome).toBe('Ana'));
    const req = http.expectOne(`${API_URL}/auth/login`);
    expect(req.request.body).toEqual({ email: 'ana@example.com', senha: 'Senha@123' });
    req.flush({
      accessToken: jwtComExpiracao(Date.now() + 60_000), refreshToken: 'refresh-1',
      usuario: { id: 'u1', nome: 'Ana', email: 'ana@example.com', tipo: 'USUARIO' }
    });
    expect(localStorage.getItem('financa_facil_refresh_token')).toBe('refresh-1');
    expect(service.estaAutenticado()).toBeTrue();
  });

  it('renova e rotaciona os tokens da sessão', () => {
    service.login('ana@example.com', 'Senha@123', false).subscribe();
    http.expectOne(`${API_URL}/auth/login`).flush({
      accessToken: jwtComExpiracao(Date.now() + 60_000), refreshToken: 'refresh-antigo',
      usuario: { id: 'u1', nome: 'Ana', email: 'ana@example.com', tipo: 'USUARIO' }
    });

    service.renovar().subscribe((ok) => expect(ok).toBeTrue());
    const req = http.expectOne(`${API_URL}/auth/refresh`);
    expect(req.request.body).toEqual({ refreshToken: 'refresh-antigo' });
    req.flush({
      accessToken: jwtComExpiracao(Date.now() + 120_000), refreshToken: 'refresh-novo',
      usuario: { id: 'u1', nome: 'Ana', email: 'ana@example.com', tipo: 'USUARIO' }
    });
    expect(sessionStorage.getItem('financa_facil_refresh_token')).toBe('refresh-novo');
  });
});

function jwtComExpiracao(expiraEm: number): string {
  return `cabecalho.${btoa(JSON.stringify({ exp: Math.floor(expiraEm / 1000) }))}.assinatura`;
}
