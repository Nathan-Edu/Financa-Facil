import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../config/api.config';
import { PerfilFinanceiroService } from './perfil-financeiro.service';

describe('PerfilFinanceiroService', () => {
  let service: PerfilFinanceiroService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PerfilFinanceiroService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('mapeia enums e guarda o perfil selecionado pela API', () => {
    service.listar().subscribe((perfis) => {
      expect(perfis[0].tipo).toBe('empresa');
      expect(perfis[0].ativo).toBeTrue();
      expect(perfis[0].dataCriacao).toBe('2026-08-23');
    });
    http.expectOne(`${API_URL}/perfis`).flush([{
      id: 'p1', nome: 'Empresa', tipo: 'EMPRESARIAL', documento: '11222333000181',
      cor: '#123456', ativo: true, selecionado: true, createdAt: '2026-08-23T10:00:00.000Z'
    }]);
    expect(service.obterPerfilAtivoId()).toBe('p1');
  });

  it('ativa o perfil no backend e atualiza a seleção local', () => {
    service.ativar('p2').subscribe((ok) => expect(ok).toBeTrue());
    const req = http.expectOne(`${API_URL}/perfis/p2/ativar`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 'p2', nome: 'Pessoal', tipo: 'PESSOAL', documento: '52998224725', cor: '#2563eb', ativo: true, selecionado: true, createdAt: '2026-08-23T10:00:00Z' });
    expect(service.obterPerfilAtivoId()).toBe('p2');
  });
});
