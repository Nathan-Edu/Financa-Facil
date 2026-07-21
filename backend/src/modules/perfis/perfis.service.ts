import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TipoPerfil } from '@prisma/client';

import { cnpjValido, cpfValido, normalizarDocumento } from '../../common/validators/documento.validator';
import { PrismaService } from '../../prisma/prisma.service';
import { AtualizarPerfilDto } from './dto/atualizar-perfil.dto';
import { CriarPerfilDto } from './dto/criar-perfil.dto';

@Injectable()
export class PerfisService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(usuarioId: string, dto: CriarPerfilDto) {
    const documento = normalizarDocumento(dto.documento);
    this.validarDocumento(dto.tipo, documento);

    const existente = await this.prisma.perfilFinanceiro.findUnique({
      where: { usuarioId_documento: { usuarioId, documento } },
    });
    if (existente) throw new ConflictException('Documento já cadastrado neste usuário');

    const quantidade = await this.prisma.perfilFinanceiro.count({ where: { usuarioId, ativo: true } });
    return this.prisma.$transaction(async (tx) => {
      const perfil = await tx.perfilFinanceiro.create({
        data: {
          usuarioId,
          nome: dto.nome.trim(),
          tipo: dto.tipo,
          documento,
          renda: new Prisma.Decimal(dto.renda ?? 0),
          selecionado: quantidade === 0,
        },
      });
      await tx.logAuditoria.create({ data: { usuarioId, perfilId: perfil.id, acao: 'CRIAR', entidade: 'PERFIL', entidadeId: perfil.id } });
      return perfil;
    });
  }

  listar(usuarioId: string) {
    return this.prisma.perfilFinanceiro.findMany({
      where: { usuarioId, ativo: true },
      orderBy: [{ selecionado: 'desc' }, { nome: 'asc' }],
    });
  }

  async buscar(usuarioId: string, id: string) {
    const perfil = await this.prisma.perfilFinanceiro.findFirst({ where: { id, usuarioId, ativo: true } });
    if (!perfil) throw new NotFoundException('Perfil financeiro não encontrado');
    return perfil;
  }

  async atualizar(usuarioId: string, id: string, dto: AtualizarPerfilDto) {
    await this.buscar(usuarioId, id);
    return this.prisma.$transaction(async (tx) => {
      const perfil = await tx.perfilFinanceiro.update({
        where: { id },
        data: {
          nome: dto.nome?.trim(),
          renda: dto.renda === undefined ? undefined : new Prisma.Decimal(dto.renda),
        },
      });
      await tx.logAuditoria.create({ data: { usuarioId, perfilId: id, acao: 'ALTERAR', entidade: 'PERFIL', entidadeId: id } });
      return perfil;
    });
  }

  async ativar(usuarioId: string, id: string) {
    await this.buscar(usuarioId, id);
    return this.prisma.$transaction(async (tx) => {
      await tx.perfilFinanceiro.updateMany({ where: { usuarioId }, data: { selecionado: false } });
      const perfil = await tx.perfilFinanceiro.update({ where: { id }, data: { selecionado: true } });
      await tx.logAuditoria.create({ data: { usuarioId, perfilId: id, acao: 'ATIVAR', entidade: 'PERFIL', entidadeId: id } });
      return perfil;
    });
  }

  async excluir(usuarioId: string, id: string): Promise<void> {
    const perfil = await this.buscar(usuarioId, id);
    await this.prisma.$transaction(async (tx) => {
      await tx.perfilFinanceiro.update({ where: { id }, data: { ativo: false, selecionado: false } });
      await tx.logAuditoria.create({ data: { usuarioId, perfilId: id, acao: 'DESATIVAR', entidade: 'PERFIL', entidadeId: id } });
      if (perfil.selecionado) {
        const proximo = await tx.perfilFinanceiro.findFirst({ where: { usuarioId, ativo: true } });
        if (proximo) await tx.perfilFinanceiro.update({ where: { id: proximo.id }, data: { selecionado: true } });
      }
    });
  }

  private validarDocumento(tipo: TipoPerfil, documento: string): void {
    const valido = tipo === TipoPerfil.PESSOAL ? cpfValido(documento) : cnpjValido(documento);
    if (!valido) throw new BadRequestException(tipo === TipoPerfil.PESSOAL ? 'CPF inválido' : 'CNPJ inválido');
  }
}
