import {
  Injectable,
  NotFoundException
} from '@nestjs/common';

import {
  Cron,
  CronExpression
} from '@nestjs/schedule';

import {
  PrioridadeAlerta,
  StatusParcela,
  StatusTransacao,
  TipoAlerta,
  TipoCategoria,
  TipoTransacao
} from '@prisma/client';

import {
  AcessoPerfilService
} from '../../common/services/acesso-perfil.service';

import {
  PrismaService
} from '../../prisma/prisma.service';

import {
  AtualizarAlertaDto
} from './dto/atualizar-alerta.dto';


@Injectable()
export class AlertasService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly acesso: AcessoPerfilService
  ) {}


  async listar(
    usuarioId: string,
    perfilId: string
  ) {

    await this.acesso.verificar(
      usuarioId,
      perfilId
    );

    return this.prisma.alerta.findMany({

      where: {
        perfilId
      },

      include: {

        parcela: {
          include: {
            contaParcelada: true
          }
        },

        categoria: true

      },

      orderBy: [
        {
          lido: 'asc'
        },
        {
          dataAlerta: 'desc'
        }
      ]

    });

  }


  async marcarLido(
    usuarioId: string,
    id: string
  ) {

    const alerta =
      await this.prisma.alerta.findFirst({

        where: {

          id,

          perfil: {
            usuarioId,
            ativo: true
          }

        }

      });


    if (!alerta) {

      throw new NotFoundException(
        'Alerta não encontrado'
      );

    }


    return this.prisma.alerta.update({

      where: {
        id
      },

      data: {
        lido: true
      }

    });

  }


  async atualizar(
    usuarioId: string,
    id: string,
    dto: AtualizarAlertaDto
  ) {

    const alerta =
      await this.prisma.alerta.findFirst({

        where: {

          id,

          perfil: {
            usuarioId,
            ativo: true
          }

        }

      });


    if (!alerta) {

      throw new NotFoundException(
        'Alerta não encontrado'
      );

    }


    return this.prisma.alerta.update({

      where: {
        id
      },

      data: {

        lido:
          dto.lido,

        descartado:
          dto.descartado

      }

    });

  }


  async marcarTodosLidos(
    usuarioId: string,
    perfilId: string
  ) {

    await this.acesso.verificar(
      usuarioId,
      perfilId
    );


    const resultado =
      await this.prisma.alerta.updateMany({

        where: {

          perfilId,

          lido: false

        },

        data: {
          lido: true
        }

      });


    return {
      atualizados:
        resultado.count
    };

  }


  // =====================================================
  // PROCESSAMENTO AUTOMÁTICO DIÁRIO
  // =====================================================

  @Cron(
    CronExpression.EVERY_DAY_AT_1AM,
    {
      timeZone:
        'America/Sao_Paulo'
    }
  )
  async processarAlertas(): Promise<{

    vencidas: number;

    alertasVencimento: number;

    alertasOrcamento: number;

  }> {

    const resultadoVencimentos =
      await this.processarVencimentos();

    const alertasOrcamento =
      await this.processarOrcamentos();


    return {

      vencidas:
        resultadoVencimentos.vencidas,

      alertasVencimento:
        resultadoVencimentos.alertas,

      alertasOrcamento

    };

  }


  // =====================================================
  // VENCIMENTOS
  // =====================================================

  private async processarVencimentos():
    Promise<{
      vencidas: number;
      alertas: number;
    }> {

    const hoje =
      new Date();

    hoje.setUTCHours(
      0,
      0,
      0,
      0
    );


    const limite =
      new Date(hoje);

    limite.setUTCDate(
      limite.getUTCDate() + 7
    );


    // Marca parcelas vencidas
    const vencidas =
      await this.prisma.parcela.updateMany({

        where: {

          status:
            StatusParcela.PENDENTE,

          dataVencimento: {
            lt: hoje
          }

        },

        data: {
          status:
            StatusParcela.VENCIDA
        }

      });


    // ===================================================
    // ALERTA DE PARCELA VENCIDA
    // ===================================================

    const parcelasVencidas =
      await this.prisma.parcela.findMany({

        where: {

          status:
            StatusParcela.VENCIDA

        },

        include: {
          contaParcelada: true
        }

      });


    let alertasCriados = 0;


    for (
      const parcela
      of parcelasVencidas
    ) {

      const chave =
        `VENCIMENTO:${parcela.id}`;


      const existente =
        await this.prisma.alerta.findUnique({

          where: {
            chave
          }

        });


      if (existente) {

        await this.prisma.alerta.update({

          where: {
            id: existente.id
          },

          data: {

            tipo:
              TipoAlerta.VENCIMENTO,

            prioridade:
              PrioridadeAlerta.ALTA,

            titulo:
              'Parcela vencida',

            mensagem:
              `Parcela ${parcela.numero}/${parcela.contaParcelada.quantidadeParcelas} de ${parcela.contaParcelada.descricao} está vencida.`,

            lido:
              false,

            descartado:
              false,

            dataAlerta:
              new Date()

          }

        });

      } else {

        await this.prisma.alerta.create({

          data: {

            perfilId:
              parcela.contaParcelada
                .perfilId,

            parcelaId:
              parcela.id,

            chave,

            tipo:
              TipoAlerta.VENCIMENTO,

            prioridade:
              PrioridadeAlerta.ALTA,

            titulo:
              'Parcela vencida',

            mensagem:
              `Parcela ${parcela.numero}/${parcela.contaParcelada.quantidadeParcelas} de ${parcela.contaParcelada.descricao} está vencida.`

          }

        });


        alertasCriados++;

      }

    }


    // ===================================================
    // ALERTAS PRÓXIMOS 7 DIAS
    // ===================================================

    const proximas =
      await this.prisma.parcela.findMany({

        where: {

          status:
            StatusParcela.PENDENTE,

          dataVencimento: {

            gte: hoje,

            lte: limite

          }

        },

        include: {
          contaParcelada: true
        }

      });


    for (
      const parcela
      of proximas
    ) {

      const chave =
        `VENCIMENTO:${parcela.id}`;


      const existente =
        await this.prisma.alerta.findUnique({

          where: {
            chave
          }

        });


      if (!existente) {

        await this.prisma.alerta.create({

          data: {

            perfilId:
              parcela.contaParcelada
                .perfilId,

            parcelaId:
              parcela.id,

            chave,

            tipo:
              TipoAlerta.VENCIMENTO,

            prioridade:
              PrioridadeAlerta.MEDIA,

            titulo:
              'Próximo vencimento',

            mensagem:
              `Parcela ${parcela.numero}/${parcela.contaParcelada.quantidadeParcelas} de ${parcela.contaParcelada.descricao} vence em breve.`

          }

        });


        alertasCriados++;

      }

    }


    return {

      vencidas:
        vencidas.count,

      alertas:
        alertasCriados

    };

  }


  // =====================================================
  // ORÇAMENTOS
  // =====================================================

  async processarOrcamentos(
    perfilId?: string
  ): Promise<number> {

    const agora =
      new Date();


    const inicioMes =
      new Date(
        Date.UTC(
          agora.getUTCFullYear(),
          agora.getUTCMonth(),
          1
        )
      );


    const inicioProximoMes =
      new Date(
        Date.UTC(
          agora.getUTCFullYear(),
          agora.getUTCMonth() + 1,
          1
        )
      );


    const referenciaMes =
      `${agora.getUTCFullYear()}-${String(
        agora.getUTCMonth() + 1
      ).padStart(
        2,
        '0'
      )}`;


    const categorias =
      await this.prisma.categoria.findMany({

        where: {

          perfilId,

          ativa: true,

          tipo: {
            in: [
              TipoCategoria.DESPESA,
              TipoCategoria.AMBOS
            ]
          },

          orcamentoMensal: {
            gt: 0
          }

        }

      });


    let alertasCriados = 0;


    for (
      const categoria
      of categorias
    ) {

      const [
        transacoes,
        parcelas
      ] =
        await this.prisma.$transaction([

          this.prisma.transacao.aggregate({

            _sum: {
              valor: true
            },

            where: {

              categoriaId:
                categoria.id,

              tipo:
                TipoTransacao.DESPESA,

              status:
                StatusTransacao.PAGA,

              dataCompetencia: {

                gte:
                  inicioMes,

                lt:
                  inicioProximoMes

              }

            }

          }),


          this.prisma.parcela.aggregate({

            _sum: {
              valor: true
            },

            where: {

              contaParcelada: {
                categoriaId:
                  categoria.id
              },

              status: {

                in: [
                  StatusParcela.PAGA,
                  StatusParcela.PENDENTE,
                  StatusParcela.VENCIDA
                ]

              },

              dataVencimento: {

                gte:
                  inicioMes,

                lt:
                  inicioProximoMes

              }

            }

          })

        ]);


      const gastoTransacoes =
        transacoes._sum.valor
          ?.toNumber() ?? 0;


      const gastoParcelas =
        parcelas._sum.valor
          ?.toNumber() ?? 0;


      const gastoMes =
        Math.round(
          (
            gastoTransacoes +
            gastoParcelas
          ) * 100
        ) / 100;


      const orcamento =
        categoria.orcamentoMensal
          ?.toNumber() ?? 0;


      if (orcamento <= 0) {

        continue;

      }


      const percentual =
        (
          gastoMes /
          orcamento
        ) * 100;


      // ===================================================
      // EXCEDIDO
      // ===================================================

      if (
        percentual >= 100
      ) {

        const chave =
          `ORCAMENTO:${categoria.id}:${referenciaMes}`;

        const existente =
          await this.prisma.alerta.findUnique({

            where: {
              chave
            }

          });

        if (existente) {

          await this.prisma.alerta.update({

            where: {
              id: existente.id
            },

            data: {

              tipo:
                TipoAlerta.ORCAMENTO,

              prioridade:
                PrioridadeAlerta.ALTA,

              titulo:
                'Orçamento excedido',

              mensagem:
                `A categoria ${categoria.nome} ultrapassou o orçamento mensal. Foram utilizados ${percentual.toFixed(2)}% do limite.`,

              lido:
                false,

              descartado:
                false,

              dataAlerta:
                new Date()

            }

          });

        } else {

          await this.prisma.alerta.create({

            data: {

              perfilId:
                categoria.perfilId,

              categoriaId:
                categoria.id,

              chave,

              tipo:
                TipoAlerta.ORCAMENTO,

              prioridade:
                PrioridadeAlerta.ALTA,

              titulo:
                'Orçamento excedido',

              mensagem:
                `A categoria ${categoria.nome} ultrapassou o orçamento mensal. Foram utilizados ${percentual.toFixed(2)}% do limite.`

            }

          });

          alertasCriados++;

        }

        continue;

      }

      // ===================================================
      // ATENÇÃO
      // ===================================================

      if (
        percentual >= 80
      ) {

        const chave =
          `ORCAMENTO:${categoria.id}:${referenciaMes}`;

        const existente =
          await this.prisma.alerta.findUnique({

            where: {
              chave
            }

          });

        if (!existente) {

          await this.prisma.alerta.create({

            data: {

              perfilId:
                categoria.perfilId,

              categoriaId:
                categoria.id,

              chave,

              tipo:
                TipoAlerta.ORCAMENTO,

              prioridade:
                PrioridadeAlerta.MEDIA,

              titulo:
                'Orçamento próximo do limite',

              mensagem:
                `A categoria ${categoria.nome} já utilizou ${percentual.toFixed(2)}% do orçamento mensal.`

            }

          });

          alertasCriados++;

        }

      }

    }


    return alertasCriados;

  }

}