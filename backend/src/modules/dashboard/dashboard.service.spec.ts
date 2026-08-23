import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  it('inclui todo o último dia usando o início exclusivo do mês seguinte', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-31T18:00:00.000Z'));
    const aggregate = jest.fn().mockResolvedValue({ _sum: { valor: null } });
    const prisma = {
      transacao: { aggregate, findMany: jest.fn().mockResolvedValue([]) },
      parcela: { aggregate: jest.fn().mockResolvedValue({ _sum: { valor: null } }), findFirst: jest.fn().mockResolvedValue(null) },
      contaParcelada: { count: jest.fn().mockResolvedValue(0) },
      alerta: { findMany: jest.fn().mockResolvedValue([]) },
      $transaction: (operacoes: Promise<unknown>[]) => Promise.all(operacoes),
    };
    const acesso = { verificar: jest.fn().mockResolvedValue(undefined) };
    const service = new DashboardService(prisma as never, acesso as never);

    await service.resumo('usuario', 'perfil');

    expect(aggregate.mock.calls[0][0].where.dataPagamento).toEqual({
      gte: new Date('2026-08-01T00:00:00.000Z'),
      lt: new Date('2026-09-01T00:00:00.000Z'),
    });
    jest.useRealTimers();
  });
});
