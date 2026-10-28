import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { API_URL } from '../config/api.config';
import { CategoriaService } from './categoria.service';
import { PerfilFinanceiroService } from './perfil-financeiro.service';
import { ReceitaService } from './receita.service';

describe('ReceitaService', () => {
  it('envia a configuração de recorrência e registra a primeira receita como paga', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PerfilFinanceiroService, useValue: { obterPerfilAtivoId: () => 'p1' } },
        { provide: CategoriaService, useValue: { resolverId: () => of('c1') } },
      ],
    });
    const service = TestBed.inject(ReceitaService);
    const http = TestBed.inject(HttpTestingController);

    service.criar({
      descricao: 'Salário', categoria: 'Trabalho', valor: 1000, data: '2026-08-01',
      recorrente: true, frequenciaRecorrencia: 'mensal', recorrenteAte: '2026-12-01',
    }).subscribe((receita) => expect(receita.recorrente).toBeTrue());

    const criacao = http.expectOne(`${API_URL}/transacoes`);
    expect(criacao.request.body).toEqual(jasmine.objectContaining({
      recorrente: true, frequenciaRecorrencia: 'MENSAL', recorrenteAte: '2026-12-01',
    }));
    criacao.flush(transacaoApi('t1'));

    const pagamento = http.expectOne(`${API_URL}/transacoes/t1/pagar`);
    expect(pagamento.request.method).toBe('PATCH');
    pagamento.flush(transacaoApi('t1'));
    http.verify();
  });
});

function transacaoApi(id: string) {
  return {
    id, descricao: 'Salário', valor: 1000, dataCompetencia: '2026-08-01T00:00:00.000Z',
    recorrente: true, frequenciaRecorrencia: 'MENSAL', recorrenteAte: '2026-12-01T00:00:00.000Z',
    categoria: { id: 'c1', nome: 'Trabalho' },
  };
}
