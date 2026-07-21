import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatusTransacao, TipoCategoria, TipoTransacao } from '@prisma/client';

import { AcessoPerfilService } from '../../common/services/acesso-perfil.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AtualizarTransacaoDto, CriarTransacaoDto, FiltroTransacoesDto } from './dto/transacao.dto';

@Injectable()
export class TransacoesService {
  constructor(private readonly prisma: PrismaService, private readonly acesso: AcessoPerfilService) {}

  async criar(usuarioId: string, dto: CriarTransacaoDto) {
    await this.acesso.verificar(usuarioId, dto.perfilId);
    await this.validarCategoria(dto.perfilId, dto.categoriaId, dto.tipo);

    return this.prisma.$transaction(async (tx) => {
      const transacao = await tx.transacao.create({
        data: {
          perfilId: dto.perfilId,
          categoriaId: dto.categoriaId,
          tipo: dto.tipo,
          descricao: dto.descricao.trim(),
          valor: new Prisma.Decimal(dto.valor),
          dataCompetencia: this.dataCivil(dto.dataCompetencia),
          dataVencimento: dto.dataVencimento ? this.dataCivil(dto.dataVencimento) : null,
          status: StatusTransacao.PENDENTE,
          observacao: dto.observacao?.trim(),
          recorrente: dto.recorrente ?? false,
          formaPagamento: dto.formaPagamento?.trim(),
        },
        include: { categoria: true },
      });
      await tx.logAuditoria.create({
        data: { usuarioId, perfilId: dto.perfilId, acao: 'CRIAR', entidade: 'TRANSACAO', entidadeId: transacao.id },
      });
      return transacao;
    });
  }

  async listar(usuarioId: string, filtro: FiltroTransacoesDto) {
    await this.acesso.verificar(usuarioId, filtro.perfilId);
    if (filtro.dataInicial && filtro.dataFinal && filtro.dataInicial > filtro.dataFinal) {
      throw new BadRequestException('A data inicial não pode ser posterior à data final');
    }

    const where: Prisma.TransacaoWhereInput = {
      perfilId: filtro.perfilId,
      tipo: filtro.tipo,
      status: filtro.status,
      categoriaId: filtro.categoriaId,
      descricao: filtro.busca ? { contains: filtro.busca, mode: 'insensitive' } : undefined,
      dataCompetencia: {
        gte: filtro.dataInicial ? this.dataCivil(filtro.dataInicial) : undefined,
        lte: filtro.dataFinal ? this.dataCivil(filtro.dataFinal) : undefined,
      },
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.transacao.findMany({
        where,
        include: { categoria: true },
        orderBy: [{ dataCompetencia: 'desc' }, { createdAt: 'desc' }],
        skip: (filtro.page - 1) * filtro.limit,
        take: filtro.limit,
      }),
      this.prisma.transacao.count({ where }),
    ]);
    return { data, meta: { page: filtro.page, limit: filtro.limit, total, totalPages: Math.ceil(total / filtro.limit) } };
  }

  async buscar(usuarioId: string, id: string) {
    const transacao = await this.prisma.transacao.findFirst({
      where: { id, perfil: { usuarioId, ativo: true } },
      include: { categoria: true },
    });
    if (!transacao) throw new NotFoundException('Transação não encontrada');
    return transacao;
  }

  async atualizar(usuarioId: string, id: string, dto: AtualizarTransacaoDto) {
    const atual = await this.buscar(usuarioId, id);
    if (atual.status === StatusTransacao.CANCELADA) throw new BadRequestException('Transação cancelada não pode ser editada');
    if (dto.categoriaId) await this.validarCategoria(atual.perfilId, dto.categoriaId, atual.tipo);

    return this.prisma.$transaction(async (tx) => {
      const transacao = await tx.transacao.update({
        where: { id },
        data: {
          categoriaId: dto.categoriaId,
          descricao: dto.descricao?.trim(),
          valor: dto.valor === undefined ? undefined : new Prisma.Decimal(dto.valor),
          dataCompetencia: dto.dataCompetencia ? this.dataCivil(dto.dataCompetencia) : undefined,
          dataVencimento: dto.dataVencimento ? this.dataCivil(dto.dataVencimento) : undefined,
          observacao: dto.observacao?.trim(),
          recorrente: dto.recorrente,
          formaPagamento: dto.formaPagamento?.trim(),
        },
        include: { categoria: true },
      });
      await tx.logAuditoria.create({
        data: { usuarioId, perfilId: atual.perfilId, acao: 'ALTERAR', entidade: 'TRANSACAO', entidadeId: id },
      });
      return transacao;
    });
  }

  async pagar(usuarioId: string, id: string) {
    const atual = await this.buscar(usuarioId, id);
    if (atual.status !== StatusTransacao.PENDENTE) throw new BadRequestException('Somente transações pendentes podem ser pagas');
    return this.prisma.$transaction(async (tx) => {
      const transacao = await tx.transacao.update({
        where: { id },
        data: { status: StatusTransacao.PAGA, dataPagamento: new Date() },
        include: { categoria: true },
      });
      await tx.logAuditoria.create({
        data: { usuarioId, perfilId: atual.perfilId, acao: 'PAGAR', entidade: 'TRANSACAO', entidadeId: id },
      });
      return transacao;
    });
  }

  async excluir(usuarioId: string, id: string): Promise<void> {
    const atual = await this.buscar(usuarioId, id);
    await this.prisma.$transaction([
      this.prisma.transacao.update({ where: { id }, data: { status: StatusTransacao.CANCELADA } }),
      this.prisma.logAuditoria.create({
        data: { usuarioId, perfilId: atual.perfilId, acao: 'CANCELAR', entidade: 'TRANSACAO', entidadeId: id },
      }),
    ]);
  }

  private async validarCategoria(perfilId: string, categoriaId: string, tipo: TipoTransacao): Promise<void> {
    const tipos = tipo === TipoTransacao.RECEITA
      ? [TipoCategoria.RECEITA, TipoCategoria.AMBOS]
      : [TipoCategoria.DESPESA, TipoCategoria.AMBOS];
    const categoria = await this.prisma.categoria.count({
      where: { id: categoriaId, perfilId, ativa: true, tipo: { in: tipos } },
    });
    if (!categoria) throw new BadRequestException('Categoria inválida para o perfil e tipo de transação');
  }

  private dataCivil(valor: string): Date {
    return new Date(`${valor.slice(0, 10)}T00:00:00.000Z`);
  }
}
