import { FrequenciaRecorrencia } from '@prisma/client';

import { adicionarPeriodo, deslocarVencimento } from './recorrencia.utils';

describe('recorrência de transações', () => {
  it('preserva o último dia possível ao avançar meses', () => {
    expect(adicionarPeriodo(new Date('2026-01-31T00:00:00Z'), FrequenciaRecorrencia.MENSAL).toISOString())
      .toBe('2026-02-28T00:00:00.000Z');
  });

  it('preserva a distância do vencimento em relação à competência', () => {
    const vencimento = deslocarVencimento(
      new Date('2026-01-10T00:00:00Z'),
      new Date('2026-01-15T00:00:00Z'),
      new Date('2026-02-10T00:00:00Z'),
    );
    expect(vencimento?.toISOString()).toBe('2026-02-15T00:00:00.000Z');
  });

  it('trata ano bissexto e recorrência semanal entre anos', () => {
    expect(adicionarPeriodo(new Date('2024-02-29'), FrequenciaRecorrencia.ANUAL).toISOString().slice(0, 10)).toBe('2025-02-28');
    expect(adicionarPeriodo(new Date('2026-12-29'), FrequenciaRecorrencia.SEMANAL).toISOString().slice(0, 10)).toBe('2027-01-05');
    expect(deslocarVencimento(new Date('2026-01-01'), null, new Date('2026-02-01'))).toBeNull();
  });
});
