import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TipoUsuario } from '@prisma/client';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { UsuarioAutenticado } from '../decorators/usuario-atual.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permitidos = this.reflector.getAllAndOverride<TipoUsuario[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!permitidos?.length) return true;
    const usuario = context.switchToHttp().getRequest<{ user: UsuarioAutenticado }>().user;
    if (!usuario || !permitidos.includes(usuario.tipo as TipoUsuario)) {
      throw new ForbiddenException('Usuário sem permissão para esta operação');
    }
    return true;
  }
}
