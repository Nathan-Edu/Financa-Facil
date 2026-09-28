import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  StatusParcela,
  StatusTransacao,
  TipoCategoria,
  TipoTransacao
} from '@prisma/client';

import { AcessoPerfilService } from '../../common/services/acesso-perfil.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AtualizarCategoriaDto, CriarCategoriaDto } from './dto/categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService, private readonly acesso: AcessoPerfilService) {}

  async criar(usuarioId: string, dto: CriarCategoriaDto) {
    await this.acesso.verificar(usuarioId, dto.perfilId);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const nome = dto.nome.trim();
        const existente = await tx.categoria.findUnique({ where: { perfilId_nome_tipo: { perfilId: dto.perfilId, nome, tipo: dto.tipo } } });
        if (existente?.ativa) throw new ConflictException('Categoria já cadastrada');
        const dados = {
          nome, tipo: dto.tipo, icone: dto.icone, cor: dto.cor,
          orcamentoMensal: dto.orcamentoMensal === undefined ? undefined : new Prisma.Decimal(dto.orcamentoMensal), ativa: true,
        };
        const categoria = existente
          ? await tx.categoria.update({ where: { id: existente.id }, data: dados })
          : await tx.categoria.create({ data: { perfilId: dto.perfilId, ...dados } });
        await tx.logAuditoria.create({ data: { usuarioId, perfilId: dto.perfilId, acao: existente ? 'REATIVAR' : 'CRIAR', entidade: 'CATEGORIA', entidadeId: categoria.id } });
        return categoria;
      });
    } catch (error: unknown) {
      if (error instanceof ConflictException) throw error;
      if (this.prismaEhDuplicado(error)) throw new ConflictException('Categoria já cadastrada');
      throw error;
    }
  }

  async listar(usuarioId: string, perfilId: string) {
    await this.acesso.verificar(usuarioId, perfilId);
    return this.prisma.categoria.findMany({ where: { perfilId, ativa: true }, orderBy: { nome: 'asc' } });
  }

  async atualizar(usuarioId: string, id: string, dto: AtualizarCategoriaDto) {
    await this.buscarDoUsuario(usuarioId, id);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const categoria = await tx.categoria.update({
          where: { id },
          data: {
            nome: dto.nome?.trim(), tipo: dto.tipo, ativa: dto.ativa, icone: dto.icone, cor: dto.cor,
            orcamentoMensal: dto.orcamentoMensal === undefined ? undefined : new Prisma.Decimal(dto.orcamentoMensal),
          },
        });
        await tx.logAuditoria.create({ data: { usuarioId, perfilId: categoria.perfilId, acao: 'ALTERAR', entidade: 'CATEGORIA', entidadeId: id } });
        return categoria;
      });
    } catch (error: unknown) {
      if (this.prismaEhDuplicado(error)) throw new ConflictException('Categoria já cadastrada');
      throw error;
    }
  }

  async excluir(usuarioId: string, id: string): Promise<void> {
    const categoria = await this.buscarDoUsuario(usuarioId, id);
    await this.prisma.$transaction([
      this.prisma.categoria.update({ where: { id }, data: { ativa: false } }),
      this.prisma.logAuditoria.create({ data: { usuarioId, perfilId: categoria.perfilId, acao: 'DESATIVAR', entidade: 'CATEGORIA', entidadeId: id } }),
    ]);
  }

  private async buscarDoUsuario(usuarioId: string, id: string) {
    const categoria = await this.prisma.categoria.findFirst({ where: { id, perfil: { usuarioId, ativo: true } } });
    if (!categoria) throw new NotFoundException('Categoria não encontrada');
    return categoria;
  }

  private prismaEhDuplicado(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
  }

  async orcamentos(
  usuarioId: string,
  perfilId: string
) {

  await this.acesso.verificar(
    usuarioId,
    perfilId
  );


  // =====================================================
  // PERÍODO = MÊS ATUAL
  // =====================================================

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


  // =====================================================
  // BUSCAS
  // =====================================================

  const [
    categorias,
    transacoes,
    parcelas
  ] = await this.prisma.$transaction([

    // Categorias de despesa
    this.prisma.categoria.findMany({

      where: {

        perfilId,

        ativa: true,

        tipo: {
          in: [
            TipoCategoria.DESPESA,
            TipoCategoria.AMBOS
          ]
        }

      },

      orderBy: {
        nome: 'asc'
      }

    }),


    // Despesas normais pagas no mês
    this.prisma.transacao.findMany({

      where: {

        perfilId,

        tipo:
          TipoTransacao.DESPESA,

        status:
          StatusTransacao.PAGA,

        dataPagamento: {

          gte: inicioMes,

          lt: inicioProximoMes

        }

      },

      select: {

        categoriaId: true,

        valor: true

      }

    }),


    // Parcelas pertencentes ao mês
    this.prisma.parcela.findMany({

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

        dataVencimento: {

          gte: inicioMes,

          lt: inicioProximoMes

        }

      },

      select: {

        valor: true,

        contaParcelada: {

          select: {
            categoriaId: true
          }

        }

      }

    })

  ]);


  // =====================================================
  // SOMA DESPESAS NORMAIS POR CATEGORIA
  // =====================================================

  const gastosTransacoes =
    new Map<string, number>();

  for (
    const transacao
    of transacoes
  ) {

    const atual =
      gastosTransacoes.get(
        transacao.categoriaId
      ) ?? 0;

    gastosTransacoes.set(
      transacao.categoriaId,
      atual +
      transacao.valor.toNumber()
    );

  }


  // =====================================================
  // SOMA PARCELAS POR CATEGORIA
  // =====================================================

  const gastosParcelas =
    new Map<string, number>();

  for (
    const parcela
    of parcelas
  ) {

    const categoriaId =
      parcela.contaParcelada
        .categoriaId;

    const atual =
      gastosParcelas.get(
        categoriaId
      ) ?? 0;

    gastosParcelas.set(
      categoriaId,
      atual +
      parcela.valor.toNumber()
    );

  }


  // =====================================================
  // RESULTADO
  // =====================================================

  return categorias.map(
    (categoria) => {

      const orcamentoMensal =
        categoria.orcamentoMensal
          ?.toNumber() ?? 0;


      const gastoTransacoes =
        gastosTransacoes.get(
          categoria.id
        ) ?? 0;


      const gastoParcelas =
        gastosParcelas.get(
          categoria.id
        ) ?? 0;


      const gastoMes =
        Math.round(
          (
            gastoTransacoes +
            gastoParcelas
          ) * 100
        ) / 100;

      const restanteBruto =
        orcamentoMensal -
        gastoMes;

      const restante =
        Math.max(
          Math.round(
            restanteBruto * 100
          ) / 100,
          0
        );

      const percentual =
        orcamentoMensal > 0
          ? (
              gastoMes /
              orcamentoMensal
            ) * 100
          : 0;


      let status:
        | 'SEM_ORCAMENTO'
        | 'NORMAL'
        | 'ATENCAO'
        | 'EXCEDIDO';


      if (
        orcamentoMensal <= 0
      ) {

        status =
          'SEM_ORCAMENTO';

      } else if (
        percentual >= 100
      ) {

        status =
          'EXCEDIDO';

      } else if (
        percentual >= 80
      ) {

        status =
          'ATENCAO';

      } else {

        status =
          'NORMAL';

      }


      return {

        categoriaId:
          categoria.id,

        nome:
          categoria.nome,

        icone:
          categoria.icone,

        cor:
          categoria.cor,

        orcamentoMensal,

        gastoTransacoes,

        gastoParcelas,

        gastoMes,

        restante,

        percentual:
          Math.round(
            percentual * 100
          ) / 100,

        status

      };

    }
  );

}
}
