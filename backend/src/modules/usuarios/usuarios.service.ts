import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { AtualizarUsuarioDto, FiltroUsuariosDto } from './dto/usuario.dto';

const selecaoPublica = {
  id: true, nome: true, email: true, tipo: true, ativo: true,
  bloqueadoAte: true, ultimoLoginEm: true, createdAt: true, updatedAt: true,
} satisfies Prisma.UsuarioSelect;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  buscar(id: string) {
    return this.prisma.usuario.findUniqueOrThrow({ where: { id }, select: selecaoPublica });
  }

  async atualizar(id: string, dto: AtualizarUsuarioDto) {
    const email = dto.email?.trim().toLowerCase();
    if (email) {
      const existente = await this.prisma.usuario.findFirst({ where: { email, id: { not: id } } });
      if (existente) throw new ConflictException('E-mail já cadastrado');
    }
    return this.prisma.usuario.update({
      where: { id },
      data: { nome: dto.nome?.trim(), email },
      select: selecaoPublica,
    });
  }

  async listar(filtro: FiltroUsuariosDto) {
    const where: Prisma.UsuarioWhereInput = {
      ativo: filtro.ativo,
      tipo: filtro.tipo,
      OR: filtro.busca ? [
        { nome: { contains: filtro.busca, mode: 'insensitive' } },
        { email: { contains: filtro.busca, mode: 'insensitive' } },
      ] : undefined,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.usuario.findMany({ where, select: selecaoPublica, orderBy: { nome: 'asc' }, skip: (filtro.page - 1) * filtro.limit, take: filtro.limit }),
      this.prisma.usuario.count({ where }),
    ]);
    return { data, meta: { page: filtro.page, limit: filtro.limit, total, totalPages: Math.ceil(total / filtro.limit) } };
  }

  async alterarStatus(adminId: string, id: string, ativo: boolean) {
    if (adminId === id && !ativo) throw new BadRequestException('O administrador não pode desativar a própria conta');
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return this.prisma.$transaction(async (tx) => {
      const atualizado = await tx.usuario.update({ where: { id }, data: { ativo }, select: selecaoPublica });
      if (!ativo) await tx.refreshToken.updateMany({ where: { usuarioId: id, revogadoEm: null }, data: { revogadoEm: new Date() } });
      await tx.logAuditoria.create({ data: { usuarioId: adminId, acao: ativo ? 'ATIVAR' : 'DESATIVAR', entidade: 'USUARIO', entidadeId: id } });
      return atualizado;
    });
  }

  async alterarTipo(adminId: string, id: string, tipo: 'USUARIO' | 'ADMINISTRADOR') {
    if (adminId === id && tipo !== 'ADMINISTRADOR') throw new BadRequestException('O administrador não pode remover a própria permissão');
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return this.prisma.$transaction(async (tx) => {
      const atualizado = await tx.usuario.update({ where: { id }, data: { tipo }, select: selecaoPublica });
      await tx.logAuditoria.create({ data: { usuarioId: adminId, acao: 'ALTERAR_TIPO', entidade: 'USUARIO', entidadeId: id } });
      return atualizado;
    });
  }
}
