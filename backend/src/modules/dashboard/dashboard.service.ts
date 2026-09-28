import {
  BadRequestException,
  Injectable
} from '@nestjs/common';

import {
  StatusContaParcelada,
  StatusParcela,
  StatusTransacao,
  TipoTransacao
} from '@prisma/client';

import {
  AcessoPerfilService
} from '../../common/services/acesso-perfil.service';

import {
  PrismaService
} from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly acesso: AcessoPerfilService
  ) {}

  async resumo(
    usuarioId: string,
    perfilId: string,
    inicio?: string,
    fim?: string,
    todoPeriodo = false
  ) {

    await this.acesso.verificar(
      usuarioId,
      perfilId
    );

    const periodo =
      todoPeriodo
        ? null
        : this.obterPeriodo(
            inicio,
            fim
          );

    const filtroPeriodo =
      periodo
        ? {
            gte:
              periodo.inicioPeriodo,

            lt:
              periodo.fimPeriodo
          }
        : undefined;

    const [
      receitas,
      despesas,
      parcelasPeriodo,
      parceladoEmAberto,
      quantidadeParceladas,
      recentes,
      proximaParcela,
      alertas
    ] = await this.prisma.$transaction([

      // =====================================================
      // RECEITAS DO PERÍODO
      // =====================================================

      this.prisma.transacao.aggregate({

        _sum: {
          valor: true
        },

        where: {

          perfilId,

          tipo:
            TipoTransacao.RECEITA,

          status:
            StatusTransacao.PAGA,

          dataCompetencia: filtroPeriodo

        }

      }),

      // =====================================================
      // DESPESAS NORMAIS DO PERÍODO
      // =====================================================

      this.prisma.transacao.aggregate({

        _sum: {
          valor: true
        },

        where: {

          perfilId,

          tipo:
            TipoTransacao.DESPESA,

          status:
            StatusTransacao.PAGA,

          dataCompetencia: 
            filtroPeriodo

        }

      }),

      // =====================================================
      // PARCELAS REFERENTES AO PERÍODO
      // =====================================================

      this.prisma.parcela.aggregate({

        _sum: {
          valor: true
        },

        where: {

          contaParcelada: {
            perfilId
          },

          status: {
            in: [
              StatusParcela.PAGA,
              StatusParcela.PENDENTE,
              StatusParcela.VENCIDA
            ]
          },

          dataVencimento:
            filtroPeriodo

        }

      }),

      // =====================================================
      // TOTAL PARCELADO AINDA EM ABERTO
      // NÃO DEPENDE DO FILTRO
      // =====================================================

      this.prisma.parcela.aggregate({

        _sum: {
          valor: true
        },

        where: {

          contaParcelada: {
            perfilId
          },

          status: {
            in: [
              StatusParcela.PENDENTE,
              StatusParcela.VENCIDA
            ]
          }

        }

      }),

      // =====================================================
      // QUANTIDADE DE CONTAS PARCELADAS ATIVAS
      // =====================================================

      this.prisma.contaParcelada.count({

        where: {

          perfilId,

          status:
            StatusContaParcelada.ATIVA

        }

      }),

      // =====================================================
      // TRANSAÇÕES RECENTES
      // =====================================================

      this.prisma.transacao.findMany({

        where: {

          perfilId,

          status: {
            not:
              StatusTransacao.CANCELADA
          }

        },

        include: {
          categoria: true
        },

        orderBy: {
          createdAt: 'desc'
        },

        take: 5

      }),

      // =====================================================
      // PRÓXIMA PARCELA
      // =====================================================

      this.prisma.parcela.findFirst({

        where: {

          contaParcelada: {
            perfilId
          },

          status: {
            in: [
              StatusParcela.PENDENTE,
              StatusParcela.VENCIDA
            ]
          }

        },

        include: {
          contaParcelada: true
        },

        orderBy: {
          dataVencimento: 'asc'
        }

      }),

      // =====================================================
      // ALERTAS
      // =====================================================

      this.prisma.alerta.findMany({

        where: {

          perfilId,

          lido: false

        },

        orderBy: {
          dataAlerta: 'desc'
        },

        take: 5

      })

    ]);

    const totalReceitas =
      receitas._sum.valor?.toNumber() ?? 0;

    const despesasNormais =
      despesas._sum.valor?.toNumber() ?? 0;

    const valorParcelasPeriodo =
      parcelasPeriodo._sum.valor?.toNumber() ?? 0;

    const totalDespesas =
      despesasNormais +
      valorParcelasPeriodo;

    const saldo =
      totalReceitas -
      totalDespesas;

    const totalParceladas =
      parceladoEmAberto._sum.valor?.toNumber() ?? 0;

    return {

      periodo:
        periodo
          ? {
              inicio:
                periodo.inicioPeriodo,

              fim:
                new Date(
                  periodo.fimPeriodo.getTime() - 1
                )
            }
          : null,

      saldo,

      totalReceitas,

      totalDespesas,

      despesasNormais,

      valorParcelasPeriodo,

      totalParceladas,

      quantidadeParceladas,

      proximoVencimento:
        proximaParcela,

      transacoesRecentes:
        recentes,

      alertas

    };

  }

  // =====================================================
  // PERÍODO
  // =====================================================

  private obterPeriodo(
    inicio?: string,
    fim?: string
  ): {
    inicioPeriodo: Date;
    fimPeriodo: Date;
  } {

    // =====================================================
    // SEM FILTRO = MÊS ATUAL
    // =====================================================

    if (
      !inicio &&
      !fim
    ) {

      const agora =
        new Date();

      const inicioPeriodo =
        new Date(
          Date.UTC(
            agora.getUTCFullYear(),
            agora.getUTCMonth(),
            1
          )
        );

      const fimPeriodo =
        new Date(
          Date.UTC(
            agora.getUTCFullYear(),
            agora.getUTCMonth() + 1,
            1
          )
        );

      return {
        inicioPeriodo,
        fimPeriodo
      };

    }

    // =====================================================
    // FILTRO INCOMPLETO
    // =====================================================

    if (
      !inicio ||
      !fim
    ) {

      throw new BadRequestException(
        'Informe início e fim do período.'
      );

    }

    const inicioPeriodo =
      new Date(
        `${inicio}T00:00:00.000Z`
      );

    const fimInformado =
      new Date(
        `${fim}T00:00:00.000Z`
      );

    if (
      Number.isNaN(
        inicioPeriodo.getTime()
      ) ||
      Number.isNaN(
        fimInformado.getTime()
      )
    ) {

      throw new BadRequestException(
        'Período inválido.'
      );

    }

    if (
      fimInformado <
      inicioPeriodo
    ) {

      throw new BadRequestException(
        'A data final não pode ser anterior à inicial.'
      );

    }

    // O filtro usa LT.
    // Então somamos 1 dia na data final.

    const fimPeriodo =
      new Date(
        fimInformado
      );

    fimPeriodo.setUTCDate(
      fimPeriodo.getUTCDate() + 1
    );

    return {
      inicioPeriodo,
      fimPeriodo
    };

  }

}