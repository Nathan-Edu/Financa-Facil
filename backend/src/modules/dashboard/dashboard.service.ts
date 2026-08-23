import { Injectable } from '@nestjs/common';
import { StatusContaParcelada, StatusParcela, StatusTransacao, TipoTransacao } from '@prisma/client';

import { AcessoPerfilService } from '../../common/services/acesso-perfil.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService, private readonly acesso: AcessoPerfilService) {}

  async resumo(usuarioId: string, perfilId: string) {
    await this.acesso.verificar(usuarioId, perfilId);
    const agora = new Date();
    const inicioMes = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), 1));
    const inicioProximoMes = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth() + 1, 1));
    const [receitas, despesas, parcelasPagas, receitasHistoricas, despesasHistoricas, parcelasHistoricas, parceladas, recentes, proximaParcela, alertas] = await this.prisma.$transaction([
      this.prisma.transacao.aggregate({ _sum: { valor: true }, where: { perfilId, tipo: TipoTransacao.RECEITA, status: StatusTransacao.PAGA, dataPagamento: { gte: inicioMes, lt: inicioProximoMes } } }),
      this.prisma.transacao.aggregate({ _sum: { valor: true }, where: { perfilId, tipo: TipoTransacao.DESPESA, status: StatusTransacao.PAGA, dataPagamento: { gte: inicioMes, lt: inicioProximoMes } } }),
      this.prisma.parcela.aggregate({ _sum: { valor: true }, where: { contaParcelada: { perfilId }, status: StatusParcela.PAGA, dataPagamento: { gte: inicioMes, lt: inicioProximoMes } } }),
      this.prisma.transacao.aggregate({ _sum: { valor: true }, where: { perfilId, tipo: TipoTransacao.RECEITA, status: StatusTransacao.PAGA } }),
      this.prisma.transacao.aggregate({ _sum: { valor: true }, where: { perfilId, tipo: TipoTransacao.DESPESA, status: StatusTransacao.PAGA } }),
      this.prisma.parcela.aggregate({ _sum: { valor: true }, where: { contaParcelada: { perfilId }, status: StatusParcela.PAGA } }),
      this.prisma.contaParcelada.count({ where: { perfilId, status: StatusContaParcelada.ATIVA } }),
      this.prisma.transacao.findMany({ where: { perfilId, status: { not: StatusTransacao.CANCELADA } }, include: { categoria: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
      this.prisma.parcela.findFirst({ where: { contaParcelada: { perfilId }, status: { in: [StatusParcela.PENDENTE, StatusParcela.VENCIDA] } }, include: { contaParcelada: true }, orderBy: { dataVencimento: 'asc' } }),
      this.prisma.alerta.findMany({ where: { perfilId, lido: false }, orderBy: { dataAlerta: 'desc' }, take: 5 }),
    ]);
    const totalReceitas = receitas._sum.valor?.toNumber() ?? 0;
    const totalDespesas = (despesas._sum.valor?.toNumber() ?? 0) + (parcelasPagas._sum.valor?.toNumber() ?? 0);
    const saldo = (receitasHistoricas._sum.valor?.toNumber() ?? 0)
      - (despesasHistoricas._sum.valor?.toNumber() ?? 0)
      - (parcelasHistoricas._sum.valor?.toNumber() ?? 0);
    return {
      saldo,
      receitas: totalReceitas,
      despesas: totalDespesas,
      parceladas,
      proximoVencimento: proximaParcela,
      transacoesRecentes: recentes,
      alertas,
    };
  }
}
