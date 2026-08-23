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
});
