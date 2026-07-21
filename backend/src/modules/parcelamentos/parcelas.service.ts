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
      const atualizada = await tx.parcela.update({
        where: { id },
        data: { status: StatusParcela.PAGA, dataPagamento: dataPagamento ? new Date(`${dataPagamento.slice(0, 10)}T12:00:00.000Z`) : new Date() },
      });
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
