import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StatusParcela } from '@prisma/client';

import { AcessoPerfilService } from '../../common/services/acesso-perfil.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AlertasService {
  constructor(private readonly prisma: PrismaService, private readonly acesso: AcessoPerfilService) {}

  async listar(usuarioId: string, perfilId: string) {
    await this.acesso.verificar(usuarioId, perfilId);
    return this.prisma.alerta.findMany({
      where: { perfilId },
      include: { parcela: { include: { contaParcelada: true } } },
      orderBy: [{ lido: 'asc' }, { dataAlerta: 'desc' }],
    });
  }

  async marcarLido(usuarioId: string, id: string) {
    const alerta = await this.prisma.alerta.findFirst({ where: { id, perfil: { usuarioId, ativo: true } } });
    if (!alerta) throw new NotFoundException('Alerta não encontrado');
    return this.prisma.alerta.update({ where: { id }, data: { lido: true } });
  }

  async marcarTodosLidos(usuarioId: string, perfilId: string) {
    await this.acesso.verificar(usuarioId, perfilId);
    const resultado = await this.prisma.alerta.updateMany({ where: { perfilId, lido: false }, data: { lido: true } });
    return { atualizados: resultado.count };
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM, { timeZone: 'America/Sao_Paulo' })
  async processarVencimentos(): Promise<{ vencidas: number; alertas: number }> {
    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);
    const limite = new Date(hoje);
    limite.setUTCDate(limite.getUTCDate() + 7);

    const vencidas = await this.prisma.parcela.updateMany({
      where: { status: StatusParcela.PENDENTE, dataVencimento: { lt: hoje } },
      data: { status: StatusParcela.VENCIDA },
    });
    const proximas = await this.prisma.parcela.findMany({
      where: {
        status: StatusParcela.PENDENTE,
        dataVencimento: { gte: hoje, lte: limite },
        alertas: { none: {} },
      },
      include: { contaParcelada: true },
    });
    if (proximas.length) {
      await this.prisma.alerta.createMany({
        data: proximas.map((parcela) => ({
          perfilId: parcela.contaParcelada.perfilId,
          parcelaId: parcela.id,
          mensagem: `Parcela ${parcela.numero}/${parcela.contaParcelada.quantidadeParcelas} de ${parcela.contaParcelada.descricao} vence em breve.`,
        })),
        skipDuplicates: true,
      });
    }
    return { vencidas: vencidas.count, alertas: proximas.length };
  }
}
