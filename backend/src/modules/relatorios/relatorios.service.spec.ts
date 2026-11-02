import { BadRequestException } from '@nestjs/common';
import { Prisma, TipoTransacao } from '@prisma/client';
import { RelatoriosService } from './relatorios.service';

describe('RelatoriosService', () => {
  function preparar() {
    const transacoes = jest.fn().mockResolvedValue([
      { id: 'r', tipo: TipoTransacao.RECEITA, valor: new Prisma.Decimal(100), dataCompetencia: new Date('2026-01-01'), descricao: 'Entrada', categoria: { nome: 'Salário' } },
      { id: 'd', tipo: TipoTransacao.DESPESA, valor: new Prisma.Decimal(25), dataCompetencia: new Date('2026-01-02'), descricao: 'Saída', categoria: { nome: 'Compras' } },
    ]);
    const parcelas = jest.fn().mockResolvedValue([
      { id: 'p', numero: 1, valor: new Prisma.Decimal('33.34'), dataVencimento: new Date('2026-01-03'), contaParcelada: { descricao: 'Compra', categoria: { nome: 'Compras' } } },
    ]);
    const prisma = {
      transacao: { findMany: transacoes }, parcela: { findMany: parcelas },
      $transaction: (ops: Promise<unknown>[]) => Promise.all(ops),
    };
    const acesso = { verificar: jest.fn().mockResolvedValue(undefined) };
    return { service: new RelatoriosService(prisma as never, acesso as never), transacoes, parcelas, acesso };
  }
  const filtro = { perfilId: 'perfil', dataInicial: '2026-01-01', dataFinal: '2026-01-31' };

  it('soma receitas, despesas e parcelas pagas por competência/vencimento', async () => {
    const { service, transacoes, parcelas } = preparar();
    const resultado = await service.financeiro('usuario', filtro);
    expect(resultado.resumo.despesas).toBeCloseTo(58.34, 2);
    expect(resultado.resumo.saldo).toBeCloseTo(41.66, 2);
    expect(resultado.movimentacoes.map((item) => item.id)).toEqual(['p', 'd', 'r']);
    expect(resultado.porCategoria.find((item) => item.categoria === 'Compras')?.total).toBeCloseTo(58.34, 2);
    expect(resultado.evolucaoMensal).toEqual([{ mes: '2026-01', receitas: 100, despesas: 58.34 }]);
    expect(transacoes.mock.calls[0][0].where).toMatchObject({ perfilId: 'perfil', status: 'PAGA', dataCompetencia: { lte: new Date('2026-01-31T23:59:59.999Z') } });
    expect(parcelas.mock.calls[0][0].where).toMatchObject({ status: 'PAGA', dataVencimento: { gte: new Date('2026-01-01') } });
  });

  it('recusa intervalo invertido antes de consultar movimentações', async () => {
    const { service, transacoes } = preparar();
    await expect(service.financeiro('u', { ...filtro, dataFinal: '2025-12-31' })).rejects.toBeInstanceOf(BadRequestException);
    expect(transacoes).not.toHaveBeenCalled();
  });

  it('recusa acesso ao perfil de outro usuário', async () => {
    const { service, acesso, parcelas } = preparar();
    acesso.verificar.mockRejectedValue(new Error('sem acesso'));
    await expect(service.financeiro('u', filtro)).rejects.toThrow('sem acesso');
    expect(parcelas).not.toHaveBeenCalled();
  });
});
