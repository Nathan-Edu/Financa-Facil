import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FrequenciaRecorrencia, Prisma, StatusTransacao, TipoCategoria, TipoTransacao } from '@prisma/client';

import { AcessoPerfilService } from '../../common/services/acesso-perfil.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AtualizarTransacaoDto, CriarTransacaoDto, FiltroTransacoesDto } from './dto/transacao.dto';
import { adicionarPeriodo, deslocarVencimento } from './recorrencia.utils';

@Injectable()
export class TransacoesService {
  constructor(private readonly prisma: PrismaService, private readonly acesso: AcessoPerfilService) {}

  async criar(usuarioId: string, dto: CriarTransacaoDto) {
    await this.acesso.verificar(usuarioId, dto.perfilId);
    await this.validarCategoria(dto.perfilId, dto.categoriaId, dto.tipo);

    const dataCompetencia = this.dataCivil(dto.dataCompetencia);
    const recorrencia = this.configurarRecorrencia(
      dto.recorrente ?? false,
      dto.frequenciaRecorrencia,
      dto.recorrenteAte ? this.dataCivil(dto.recorrenteAte) : null,
      dataCompetencia,
    );
    return this.prisma.$transaction(async (tx) => {
      const transacao = await tx.transacao.create({
        data: {
          perfilId: dto.perfilId,
          categoriaId: dto.categoriaId,
          tipo: dto.tipo,
          descricao: dto.descricao.trim(),
          valor: new Prisma.Decimal(dto.valor),
          dataCompetencia,
          dataVencimento: dto.dataVencimento ? this.dataCivil(dto.dataVencimento) : null,
          status: StatusTransacao.PENDENTE,
          observacao: dto.observacao?.trim(),
          recorrente: dto.recorrente ?? false,
          frequenciaRecorrencia: recorrencia.frequencia,
          recorrenteAte: recorrencia.ate,
          proximaRecorrencia: recorrencia.proxima,
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

    const dataCompetencia = dto.dataCompetencia ? this.dataCivil(dto.dataCompetencia) : atual.dataCompetencia;
    const alterouRecorrencia = dto.recorrente !== undefined
      || dto.frequenciaRecorrencia !== undefined
      || dto.recorrenteAte !== undefined
      || dto.dataCompetencia !== undefined;
    const recorrencia = alterouRecorrencia
      ? this.configurarRecorrencia(
        dto.recorrente ?? atual.recorrente,
        dto.frequenciaRecorrencia ?? atual.frequenciaRecorrencia ?? undefined,
        dto.recorrenteAte === undefined
          ? atual.recorrenteAte
          : dto.recorrenteAte ? this.dataCivil(dto.recorrenteAte) : null,
        dataCompetencia,
      )
      : null;

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
          frequenciaRecorrencia: recorrencia?.frequencia,
          recorrenteAte: recorrencia?.ate,
          proximaRecorrencia: recorrencia?.proxima,
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
      this.prisma.transacao.update({
        where: { id },
        data: { status: StatusTransacao.CANCELADA, recorrente: false, proximaRecorrencia: null },
      }),
      this.prisma.logAuditoria.create({
        data: { usuarioId, perfilId: atual.perfilId, acao: 'CANCELAR', entidade: 'TRANSACAO', entidadeId: id },
      }),
    ]);
  }

  @Cron('0 2 * * *', { timeZone: 'America/Sao_Paulo' })
  async processarRecorrencias(ate = new Date()): Promise<{ geradas: number }> {
    const limite = new Date(Date.UTC(ate.getUTCFullYear(), ate.getUTCMonth(), ate.getUTCDate()));
    const modelos = await this.prisma.transacao.findMany({
      where: {
        recorrente: true,
        proximaRecorrencia: { lte: limite },
        status: { not: StatusTransacao.CANCELADA },
        perfil: { ativo: true },
      },
      include: { perfil: { select: { usuarioId: true } } },
      take: 500,
    });

    let geradas = 0;
    for (const modelo of modelos) {
      let proxima = modelo.proximaRecorrencia;
      let iteracoes = 0;
      while (proxima && proxima <= limite && iteracoes < 520) {
        const competencia = proxima;
        const candidata = adicionarPeriodo(competencia, modelo.frequenciaRecorrencia!);
        const seguinte = modelo.recorrenteAte && candidata > modelo.recorrenteAte ? null : candidata;
        const criada = await this.prisma.$transaction(async (tx) => {
          const reservado = await tx.transacao.updateMany({
            where: { id: modelo.id, recorrente: true, proximaRecorrencia: competencia },
            data: { proximaRecorrencia: seguinte, recorrente: seguinte !== null },
          });
          if (reservado.count !== 1) return false;

          const existente = await tx.transacao.findUnique({
            where: { transacaoOrigemId_dataCompetencia: { transacaoOrigemId: modelo.id, dataCompetencia: competencia } },
          });
          if (existente) return false;

          const ocorrencia = await tx.transacao.create({
            data: {
              perfilId: modelo.perfilId,
              categoriaId: modelo.categoriaId,
              tipo: modelo.tipo,
              descricao: modelo.descricao,
              valor: modelo.valor,
              dataCompetencia: competencia,
              dataVencimento: deslocarVencimento(modelo.dataCompetencia, modelo.dataVencimento, competencia),
              status: modelo.status === StatusTransacao.PAGA ? StatusTransacao.PAGA : StatusTransacao.PENDENTE,
              dataPagamento: modelo.status === StatusTransacao.PAGA ? new Date() : null,
              observacao: modelo.observacao,
              recorrente: false,
              formaPagamento: modelo.formaPagamento,
              transacaoOrigemId: modelo.id,
            },
          });
          await tx.logAuditoria.create({
            data: {
              usuarioId: modelo.perfil.usuarioId,
              perfilId: modelo.perfilId,
              acao: 'GERAR_RECORRENCIA',
              entidade: 'TRANSACAO',
              entidadeId: ocorrencia.id,
            },
          });
          return true;
        });
        if (criada) geradas += 1;
        proxima = seguinte;
        iteracoes += 1;
      }
    }
    return { geradas };
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

  private configurarRecorrencia(
    recorrente: boolean,
    frequencia: FrequenciaRecorrencia | undefined,
    ate: Date | null,
    competencia: Date,
  ): { frequencia: FrequenciaRecorrencia | null; ate: Date | null; proxima: Date | null } {
    if (!recorrente) return { frequencia: null, ate: null, proxima: null };
    const frequenciaFinal = frequencia ?? FrequenciaRecorrencia.MENSAL;
    const proxima = adicionarPeriodo(competencia, frequenciaFinal);
    if (ate && ate < proxima) {
      throw new BadRequestException('A recorrência deve permitir ao menos uma próxima ocorrência');
    }
    return { frequencia: frequenciaFinal, ate, proxima };
  }
}
