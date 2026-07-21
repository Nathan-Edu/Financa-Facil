import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatusContaParcelada, StatusParcela, TipoCategoria } from '@prisma/client';

import { AcessoPerfilService } from '../../common/services/acesso-perfil.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AtualizarParcelamentoDto, CriarParcelamentoDto, FiltroParcelamentosDto } from './dto/parcelamento.dto';
import { adicionarMeses, distribuirParcelas } from './parcelamento.utils';

type ContaComParcelas = Prisma.ContaParceladaGetPayload<{
  include: { categoria: true; parcelas: true };
}>;

@Injectable()
export class ParcelamentosService {
  constructor(private readonly prisma: PrismaService, private readonly acesso: AcessoPerfilService) {}

  async criar(usuarioId: string, dto: CriarParcelamentoDto) {
    await this.acesso.verificar(usuarioId, dto.perfilId);
    await this.validarCategoria(dto.perfilId, dto.categoriaId);
    if (dto.primeiroVencimento < dto.dataCompra) throw new BadRequestException('O primeiro vencimento não pode ser anterior à compra');
    const valores = distribuirParcelas(dto.valorTotal, dto.quantidadeParcelas);

    return this.prisma.$transaction(async (tx) => {
      const conta = await tx.contaParcelada.create({
        data: {
          perfilId: dto.perfilId,
          categoriaId: dto.categoriaId,
          descricao: dto.descricao.trim(),
          valorTotal: new Prisma.Decimal(dto.valorTotal),
          quantidadeParcelas: dto.quantidadeParcelas,
          dataCompra: this.dataCivil(dto.dataCompra),
          observacao: dto.observacao?.trim(),
          parcelas: {
            create: valores.map((valor, indice) => ({
              numero: indice + 1,
              valor: new Prisma.Decimal(valor),
              dataVencimento: adicionarMeses(dto.primeiroVencimento, indice),
            })),
          },
        },
        include: { categoria: true, parcelas: { orderBy: { numero: 'asc' } } },
      });
      await tx.logAuditoria.create({ data: { usuarioId, perfilId: dto.perfilId, acao: 'CRIAR', entidade: 'CONTA_PARCELADA', entidadeId: conta.id } });
      return conta;
    });
  }

  async listar(usuarioId: string, filtro: FiltroParcelamentosDto) {
    await this.acesso.verificar(usuarioId, filtro.perfilId);
    const where: Prisma.ContaParceladaWhereInput = {
      perfilId: filtro.perfilId,
      status: filtro.status,
      descricao: filtro.busca ? { contains: filtro.busca, mode: 'insensitive' } : undefined,
    };
    const [contas, total] = await this.prisma.$transaction([
      this.prisma.contaParcelada.findMany({
        where,
        include: { categoria: true, parcelas: { orderBy: { numero: 'asc' } } },
        orderBy: { createdAt: 'desc' }, skip: (filtro.page - 1) * filtro.limit, take: filtro.limit,
      }),
      this.prisma.contaParcelada.count({ where }),
    ]);
    return {
      data: contas.map((conta) => this.resumo(conta)),
      meta: { page: filtro.page, limit: filtro.limit, total, totalPages: Math.ceil(total / filtro.limit) },
    };
  }

  async buscar(usuarioId: string, id: string) {
    const conta = await this.prisma.contaParcelada.findFirst({
      where: { id, perfil: { usuarioId, ativo: true } },
      include: { categoria: true, parcelas: { orderBy: { numero: 'asc' } } },
    });
    if (!conta) throw new NotFoundException('Conta parcelada não encontrada');
    return this.resumo(conta);
  }

  async atualizar(usuarioId: string, id: string, dto: AtualizarParcelamentoDto) {
    const conta = await this.buscarInterno(usuarioId, id);
    if (conta.status !== StatusContaParcelada.ATIVA) throw new BadRequestException('Somente contas ativas podem ser editadas');
    if (dto.categoriaId) await this.validarCategoria(conta.perfilId, dto.categoriaId);
    return this.prisma.$transaction(async (tx) => {
      const atualizada = await tx.contaParcelada.update({
        where: { id },
        data: { categoriaId: dto.categoriaId, descricao: dto.descricao?.trim(), observacao: dto.observacao?.trim() },
        include: { categoria: true, parcelas: { orderBy: { numero: 'asc' } } },
      });
      await tx.logAuditoria.create({ data: { usuarioId, perfilId: conta.perfilId, acao: 'ALTERAR', entidade: 'CONTA_PARCELADA', entidadeId: id } });
      return atualizada;
    });
  }

  async cancelar(usuarioId: string, id: string) {
    const conta = await this.buscarInterno(usuarioId, id);
    if (conta.status !== StatusContaParcelada.ATIVA) throw new BadRequestException('Somente contas ativas podem ser canceladas');
    return this.prisma.$transaction(async (tx) => {
      await tx.parcela.updateMany({
        where: { contaParceladaId: id, status: { in: [StatusParcela.PENDENTE, StatusParcela.VENCIDA] } },
        data: { status: StatusParcela.CANCELADA },
      });
      const atualizada = await tx.contaParcelada.update({ where: { id }, data: { status: StatusContaParcelada.CANCELADA } });
      await tx.logAuditoria.create({ data: { usuarioId, perfilId: conta.perfilId, acao: 'CANCELAR', entidade: 'CONTA_PARCELADA', entidadeId: id } });
      return atualizada;
    });
  }

  private resumo(conta: ContaComParcelas) {
    const pagas = conta.parcelas.filter((parcela) => parcela.status === StatusParcela.PAGA).length;
    const proxima = conta.parcelas.find((parcela) => parcela.status === StatusParcela.PENDENTE || parcela.status === StatusParcela.VENCIDA);
    return {
      ...conta,
      parcelasPagas: pagas,
      totalParcelas: conta.quantidadeParcelas,
      percentualPago: Math.round((pagas / conta.quantidadeParcelas) * 100),
      proximoVencimento: proxima?.dataVencimento ?? null,
    };
  }

  private async buscarInterno(usuarioId: string, id: string) {
    const conta = await this.prisma.contaParcelada.findFirst({ where: { id, perfil: { usuarioId, ativo: true } } });
    if (!conta) throw new NotFoundException('Conta parcelada não encontrada');
    return conta;
  }

  private async validarCategoria(perfilId: string, categoriaId: string): Promise<void> {
    const existe = await this.prisma.categoria.count({ where: { id: categoriaId, perfilId, ativa: true, tipo: { in: [TipoCategoria.DESPESA, TipoCategoria.AMBOS] } } });
    if (!existe) throw new BadRequestException('Categoria inválida para a conta parcelada');
  }

  private dataCivil(valor: string): Date { return new Date(`${valor.slice(0, 10)}T00:00:00.000Z`); }
}
