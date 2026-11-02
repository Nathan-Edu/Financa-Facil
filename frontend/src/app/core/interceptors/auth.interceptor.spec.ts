import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { API_URL } from '../config/api.config';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor: limite da API', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['obterToken', 'obterRefreshToken', 'renovar']);
    auth.obterToken.and.returnValue('token-sintetico');
    auth.obterRefreshToken.and.returnValue('refresh-sintetico');
    auth.renovar.and.returnValue(of(true));
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(),
      { provide: AuthService, useValue: auth },
      { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
    ] });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  for (const url of ['https://externo.invalid/dados', `${API_URL}-externa/dados`]) {
    it(`não envia nem renova tokens após 401 fora da API: ${url}`, () => {
      let status = 0;
      http.get(url).subscribe({ error: (error) => status = error.status });
      const req = controller.expectOne(url);
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
      expect(status).toBe(401);
      expect(auth.renovar).not.toHaveBeenCalled();
      controller.expectNone(url);
    });
  }

  it('continua renovando e repetindo requisições da API', () => {
    const url = `${API_URL}/perfis`;
    http.get(url).subscribe();
    const req = controller.expectOne(url);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-sintetico');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.renovar).toHaveBeenCalledTimes(1);
    controller.expectOne(url).flush([]);
  });
});
