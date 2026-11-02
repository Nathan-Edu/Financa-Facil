import { BadRequestException } from '@nestjs/common';
import { StatusContaParcelada, StatusParcela } from '@prisma/client';
import { ParcelasService } from './parcelas.service';

describe('ParcelasService', () => {
  const prisma = {
    parcela: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  } as any;
  const service = new ParcelasService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('impede pagar uma parcela já paga', async () => {
    prisma.parcela.findFirst.mockResolvedValue({
      id: 'p1', status: StatusParcela.PAGA,
      contaParcelada: { status: StatusContaParcelada.ATIVA },
    });
    await expect(service.pagar('u1', 'p1')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('impede pagamento quando a conta foi cancelada', async () => {
    prisma.parcela.findFirst.mockResolvedValue({
      id: 'p1', status: StatusParcela.PENDENTE,
      contaParcelada: { status: StatusContaParcelada.CANCELADA },
    });
    await expect(service.pagar('u1', 'p1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('recusa uma disputa de pagamento sem duplicar auditoria', async () => {
    prisma.parcela.findFirst.mockResolvedValue({
      id: 'p1', status: StatusParcela.PENDENTE,
      contaParcelada: { status: StatusContaParcelada.ATIVA },
    });
    const tx = {
      contaParcelada: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      parcela: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), findUniqueOrThrow: jest.fn() },
      logAuditoria: { create: jest.fn() },
    };
    prisma.$transaction.mockImplementation((callback: (client: typeof tx) => unknown) => callback(tx));
    await expect(service.pagar('u1', 'p1')).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.logAuditoria.create).not.toHaveBeenCalled();
    expect(tx.parcela.findUniqueOrThrow).not.toHaveBeenCalled();
  });
});
