import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StatusContaParcelada, StatusParcela } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ParcelasService {
  constructor(private readonly prisma: PrismaService) {}

  async pagar(usuarioId: string, id: string, dataPagamento?: string) {
    const parcela = await this.prisma.parcela.findFirst({
      where: { id, contaParcelada: { perfil: { usuarioId, ativo: true } } },
      include: { contaParcelada: true },
    });
    if (!parcela) throw new NotFoundException('Parcela não encontrada');
    if (parcela.status !== StatusParcela.PENDENTE && parcela.status !== StatusParcela.VENCIDA) {
      throw new BadRequestException('Somente parcelas pendentes ou vencidas podem ser pagas');
    }
    if (parcela.contaParcelada.status !== StatusContaParcelada.ATIVA) {
      throw new BadRequestException('A conta parcelada não está ativa');
    }

    return this.prisma.$transaction(async (tx) => {
      // Serializa pagamentos e cancelamento da mesma conta antes de alterar parcelas.
      const contaAtiva = await tx.contaParcelada.updateMany({
        where: { id: parcela.contaParceladaId, status: StatusContaParcelada.ATIVA },
        data: { status: StatusContaParcelada.ATIVA },
      });
      if (contaAtiva.count !== 1) throw new BadRequestException('A conta parcelada não está ativa');
      const pagamento = await tx.parcela.updateMany({
        where: { id, status: { in: [StatusParcela.PENDENTE, StatusParcela.VENCIDA] }, contaParcelada: { status: StatusContaParcelada.ATIVA } },
        data: { status: StatusParcela.PAGA, dataPagamento: dataPagamento ? new Date(`${dataPagamento.slice(0, 10)}T12:00:00.000Z`) : new Date() },
      });
      if (pagamento.count !== 1) {
        throw new BadRequestException('A parcela já foi paga ou cancelada');
      }
      const atualizada = await tx.parcela.findUniqueOrThrow({ where: { id } });
      const restantes = await tx.parcela.count({
        where: { contaParceladaId: parcela.contaParceladaId, status: { in: [StatusParcela.PENDENTE, StatusParcela.VENCIDA] } },
      });
      if (restantes === 0) {
        await tx.contaParcelada.update({ where: { id: parcela.contaParceladaId }, data: { status: StatusContaParcelada.FINALIZADA } });
      }
      await tx.logAuditoria.create({
        data: { usuarioId, perfilId: parcela.contaParcelada.perfilId, acao: 'PAGAR', entidade: 'PARCELA', entidadeId: id },
      });
      return atualizada;
    });
  }
}
