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
});
