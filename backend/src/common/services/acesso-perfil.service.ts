import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AcessoPerfilService {
  constructor(private readonly prisma: PrismaService) {}

  async verificar(usuarioId: string, perfilId: string): Promise<void> {
    const existe = await this.prisma.perfilFinanceiro.count({
      where: { id: perfilId, usuarioId, ativo: true },
    });
    if (!existe) throw new NotFoundException('Perfil financeiro não encontrado');
  }
}
