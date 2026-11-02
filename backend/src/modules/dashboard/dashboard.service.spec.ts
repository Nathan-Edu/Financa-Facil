import { BadRequestException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  afterEach(() => jest.useRealTimers());
  function preparar() {
    const valor = (n: number) => ({ _sum: { valor: { toNumber: () => n } } });
    const aggregate = jest.fn().mockResolvedValueOnce(valor(100)).mockResolvedValueOnce(valor(25));
    const parcelas = jest.fn().mockResolvedValueOnce(valor(30)).mockResolvedValueOnce(valor(60));
    const prisma = {
      transacao: { aggregate, findMany: jest.fn().mockResolvedValue([]) },
      parcela: { aggregate: parcelas, findFirst: jest.fn().mockResolvedValue(null) },
      contaParcelada: { count: jest.fn().mockResolvedValue(1) },
      alerta: { findMany: jest.fn().mockResolvedValue([]) },
      $transaction: (ops: Promise<unknown>[]) => Promise.all(ops),
    };
    const acesso = { verificar: jest.fn().mockResolvedValue(undefined) };
    return { service: new DashboardService(prisma as never, acesso as never), aggregate, parcelas, acesso };
  }

  it('filtra competência até o início exclusivo do mês seguinte, e não pagamento', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-31T18:00:00Z'));
    const { service, aggregate, parcelas } = preparar();
    const resultado = await service.resumo('usuario', 'perfil');
    expect(aggregate.mock.calls[0][0].where.dataCompetencia).toEqual({
      gte: new Date('2026-08-01T00:00:00Z'), lt: new Date('2026-09-01T00:00:00Z'),
    });
    expect(aggregate.mock.calls[0][0].where.dataPagamento).toBeUndefined();
    expect(aggregate.mock.calls[1][0].where.status).toBe('PAGA');
    expect(parcelas.mock.calls[0][0].where.status.in).toEqual(['PAGA', 'PENDENTE', 'VENCIDA']);
    expect(resultado).toMatchObject({ saldo: 45, totalReceitas: 100, totalDespesas: 55, totalParceladas: 60 });
  });

  it('inclui todo o último dia do intervalo explícito', async () => {
    const { service, aggregate } = preparar();
    await service.resumo('u', 'p', '2024-02-01', '2024-02-29');
    expect(aggregate.mock.calls[0][0].where.dataCompetencia.lt).toEqual(new Date('2024-03-01T00:00:00Z'));
  });

  it.each([
    ['2026-02-30', '2026-03-01'], ['2026-01-01', undefined],
    ['2026-02-02', '2026-02-01'], ['invalida', '2026-02-01'],
  ])('rejeita período inválido %s / %s', async (inicio, fim) => {
    const { service, aggregate } = preparar();
    await expect(service.resumo('u', 'p', inicio, fim)).rejects.toBeInstanceOf(BadRequestException);
    expect(aggregate).not.toHaveBeenCalled();
  });

  it('remove filtro de datas ao solicitar todo o período', async () => {
    const { service, aggregate } = preparar();
    expect((await service.resumo('u', 'p', undefined, undefined, true)).periodo).toBeNull();
    expect(aggregate.mock.calls[0][0].where.dataCompetencia).toBeUndefined();
  });

  it('interrompe consultas financeiras quando o perfil não pertence ao usuário', async () => {
    const { service, acesso, aggregate } = preparar();
    acesso.verificar.mockRejectedValue(new Error('sem acesso'));
    await expect(service.resumo('u', 'p')).rejects.toThrow('sem acesso');
    expect(aggregate).not.toHaveBeenCalled();
  });
});
