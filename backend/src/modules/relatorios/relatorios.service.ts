import {
  BadRequestException,
  Injectable
} from '@nestjs/common';

import {
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

import {
  FiltroRelatorioDto
} from './dto/filtro-relatorio.dto';

@Injectable()
export class RelatoriosService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly acesso: AcessoPerfilService
  ) {}

  async financeiro(
    usuarioId: string,
    filtro: FiltroRelatorioDto
  ) {

    await this.acesso.verificar(
      usuarioId,
      filtro.perfilId
    );

    if (
      filtro.dataInicial >
      filtro.dataFinal
    ) {
      throw new BadRequestException(
        'Período inválido'
      );
    }

    const inicio =
      new Date(
        `${filtro.dataInicial.slice(0, 10)}T00:00:00.000Z`
      );

    const fim =
      new Date(
        `${filtro.dataFinal.slice(0, 10)}T23:59:59.999Z`
      );

    /*
     * REGRA DO RELATÓRIO
     *
     * Transações:
     * usa dataCompetencia.
     *
     * Parcelas:
     * usa dataVencimento.
     *
     * dataPagamento representa somente
     * quando o lançamento foi efetivamente pago.
     */
    const [
      transacoes,
      parcelas
    ] =
      await this.prisma.$transaction([

        this.prisma.transacao.findMany({

          where: {

            perfilId:
              filtro.perfilId,

            status:
              StatusTransacao.PAGA,

            dataCompetencia: {
              gte: inicio,
              lte: fim
            }

          },

          include: {
            categoria: true
          },

          orderBy: {
            dataCompetencia: 'asc'
          }

        }),

        this.prisma.parcela.findMany({

          where: {

            contaParcelada: {
              perfilId:
                filtro.perfilId
            },

            status:
              StatusParcela.PAGA,

            dataVencimento: {
              gte: inicio,
              lte: fim
            }

          },

          include: {

            contaParcelada: {

              include: {
                categoria: true
              }

            }

          },

          orderBy: {
            dataVencimento: 'asc'
          }

        })

      ]);

    // =====================================================
    // RECEITAS
    // =====================================================

    const receitas =
      transacoes
        .filter(
          item =>
            item.tipo ===
            TipoTransacao.RECEITA
        )
        .reduce(
          (soma, item) =>
            soma +
            item.valor.toNumber(),
          0
        );

    // =====================================================
    // DESPESAS NORMAIS
    // =====================================================

    const despesasTransacoes =
      transacoes
        .filter(
          item =>
            item.tipo ===
            TipoTransacao.DESPESA
        )
        .reduce(
          (soma, item) =>
            soma +
            item.valor.toNumber(),
          0
        );

    // =====================================================
    // DESPESAS PARCELADAS
    // =====================================================

    const despesasParcelas =
      parcelas.reduce(
        (soma, item) =>
          soma +
          item.valor.toNumber(),
        0
      );

    // =====================================================
    // CATEGORIAS
    // =====================================================

    const porCategoria =
      new Map<
        string,
        {
          categoria: string;
          tipo: string;
          total: number;
        }
      >();

    for (
      const item
      of transacoes
    ) {

      this.somarCategoria(
        porCategoria,
        item.categoria.nome,
        item.tipo,
        item.valor.toNumber()
      );

    }

    for (
      const item
      of parcelas
    ) {

      this.somarCategoria(
        porCategoria,
        item.contaParcelada
          .categoria.nome,
        TipoTransacao.DESPESA,
        item.valor.toNumber()
      );

    }

    // =====================================================
    // EVOLUÇÃO MENSAL
    // =====================================================

    const evolucao =
      new Map<
        string,
        {
          mes: string;
          receitas: number;
          despesas: number;
        }
      >();

    /*
     * Transações:
     * competência financeira.
     */
    for (
      const item
      of transacoes
    ) {

      this.somarMes(
        evolucao,
        item.dataCompetencia,
        item.tipo,
        item.valor.toNumber()
      );

    }

    /*
     * Parcelas:
     * vencimento da parcela.
     */
    for (
      const item
      of parcelas
    ) {

      this.somarMes(
        evolucao,
        item.dataVencimento,
        TipoTransacao.DESPESA,
        item.valor.toNumber()
      );

    }

    const despesas =
      despesasTransacoes +
      despesasParcelas;

    // =====================================================
    // MOVIMENTAÇÕES
    // =====================================================

    const movimentacoes = [

      ...transacoes.map(
        item => ({

          id:
            item.id,

          data:
            item.dataCompetencia
              .toISOString()
              .slice(0, 10),

          descricao:
            item.descricao,

          categoria:
            item.categoria.nome,

          tipo:
            item.tipo,

          valor:
            item.valor.toNumber()

        })
      ),

      ...parcelas.map(
        item => ({

          id:
            item.id,

          data:
            item.dataVencimento
              .toISOString()
              .slice(0, 10),

          descricao:
            `${item.contaParcelada.descricao} - parcela ${item.numero}`,

          categoria:
            item.contaParcelada
              .categoria.nome,

          tipo:
            TipoTransacao.DESPESA,

          valor:
            item.valor.toNumber()

        })
      )

    ].sort(
      (a, b) =>
        b.data.localeCompare(
          a.data
        )
    );

    // =====================================================
    // RETORNO
    // =====================================================

    return {

      periodo: {
        dataInicial:
          filtro.dataInicial,

        dataFinal:
          filtro.dataFinal
      },

      resumo: {

        receitas,

        despesas,

        saldo:
          receitas -
          despesas

      },

      porCategoria:
        [
          ...porCategoria.values()
        ].sort(
          (a, b) =>
            b.total -
            a.total
        ),

      evolucaoMensal:
        [
          ...evolucao.values()
        ].sort(
          (a, b) =>
            a.mes.localeCompare(
              b.mes
            )
        ),

      movimentacoes

    };

  }

  // =====================================================
  // SOMAR POR CATEGORIA
  // =====================================================

  private somarCategoria(
    mapa: Map<
      string,
      {
        categoria: string;
        tipo: string;
        total: number;
      }
    >,
    categoria: string,
    tipo: string,
    valor: number
  ): void {

    const chave =
      `${tipo}:${categoria}`;

    const atual =
      mapa.get(chave) ?? {
        categoria,
        tipo,
        total: 0
      };

    atual.total +=
      valor;

    mapa.set(
      chave,
      atual
    );

  }

  // =====================================================
  // SOMAR POR MÊS
  // =====================================================

  private somarMes(
    mapa: Map<
      string,
      {
        mes: string;
        receitas: number;
        despesas: number;
      }
    >,
    data: Date,
    tipo: TipoTransacao,
    valor: number
  ): void {

    const mes =
      data
        .toISOString()
        .slice(0, 7);

    const atual =
      mapa.get(mes) ?? {
        mes,
        receitas: 0,
        despesas: 0
      };

    if (
      tipo ===
      TipoTransacao.RECEITA
    ) {

      atual.receitas +=
        valor;

    } else {

      atual.despesas +=
        valor;

    }

    mapa.set(
      mes,
      atual
    );

  }

}