import { BadRequestException, Injectable } from '@nestjs/common';
import { StatusParcela, StatusTransacao, TipoTransacao } from '@prisma/client';

import { AcessoPerfilService } from '../../common/services/acesso-perfil.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FiltroRelatorioDto } from './dto/filtro-relatorio.dto';

@Injectable()
export class RelatoriosService {
  constructor(private readonly prisma: PrismaService, private readonly acesso: AcessoPerfilService) {}

  async financeiro(usuarioId: string, filtro: FiltroRelatorioDto) {
    await this.acesso.verificar(usuarioId, filtro.perfilId);
    if (filtro.dataInicial > filtro.dataFinal) throw new BadRequestException('Período inválido');
    const inicio = new Date(`${filtro.dataInicial.slice(0, 10)}T00:00:00.000Z`);
    const fim = new Date(`${filtro.dataFinal.slice(0, 10)}T23:59:59.999Z`);
    const [transacoes, parcelas] = await this.prisma.$transaction([
      this.prisma.transacao.findMany({
        where: { perfilId: filtro.perfilId, status: StatusTransacao.PAGA, dataPagamento: { gte: inicio, lte: fim } },
        include: { categoria: true }, orderBy: { dataPagamento: 'asc' },
      }),
      this.prisma.parcela.findMany({
        where: { contaParcelada: { perfilId: filtro.perfilId }, status: StatusParcela.PAGA, dataPagamento: { gte: inicio, lte: fim } },
        include: { contaParcelada: { include: { categoria: true } } }, orderBy: { dataPagamento: 'asc' },
      }),
    ]);

    const receitas = transacoes.filter((item) => item.tipo === TipoTransacao.RECEITA).reduce((soma, item) => soma + item.valor.toNumber(), 0);
    const despesasTransacoes = transacoes.filter((item) => item.tipo === TipoTransacao.DESPESA).reduce((soma, item) => soma + item.valor.toNumber(), 0);
    const despesasParcelas = parcelas.reduce((soma, item) => soma + item.valor.toNumber(), 0);
    const porCategoria = new Map<string, { categoria: string; tipo: string; total: number }>();
    for (const item of transacoes) this.somarCategoria(porCategoria, item.categoria.nome, item.tipo, item.valor.toNumber());
    for (const item of parcelas) this.somarCategoria(porCategoria, item.contaParcelada.categoria.nome, TipoTransacao.DESPESA, item.valor.toNumber());

    const evolucao = new Map<string, { mes: string; receitas: number; despesas: number }>();
    for (const item of transacoes) this.somarMes(evolucao, item.dataPagamento!, item.tipo, item.valor.toNumber());
    for (const item of parcelas) this.somarMes(evolucao, item.dataPagamento!, TipoTransacao.DESPESA, item.valor.toNumber());
    const despesas = despesasTransacoes + despesasParcelas;
    return {
      periodo: { dataInicial: filtro.dataInicial, dataFinal: filtro.dataFinal },
      resumo: { receitas, despesas, saldo: receitas - despesas },
      porCategoria: [...porCategoria.values()].sort((a, b) => b.total - a.total),
      evolucaoMensal: [...evolucao.values()].sort((a, b) => a.mes.localeCompare(b.mes)),
    };
  }

  private somarCategoria(mapa: Map<string, { categoria: string; tipo: string; total: number }>, categoria: string, tipo: string, valor: number): void {
    const chave = `${tipo}:${categoria}`;
    const atual = mapa.get(chave) ?? { categoria, tipo, total: 0 };
    atual.total += valor;
    mapa.set(chave, atual);
  }

  private somarMes(mapa: Map<string, { mes: string; receitas: number; despesas: number }>, data: Date, tipo: TipoTransacao, valor: number): void {
    const mes = data.toISOString().slice(0, 7);
    const atual = mapa.get(mes) ?? { mes, receitas: 0, despesas: 0 };
    if (tipo === TipoTransacao.RECEITA) atual.receitas += valor; else atual.despesas += valor;
    mapa.set(mes, atual);
  }
}
