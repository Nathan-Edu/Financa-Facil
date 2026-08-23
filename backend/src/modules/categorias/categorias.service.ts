import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

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
}
