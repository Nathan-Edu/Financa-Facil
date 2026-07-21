import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UsuarioAutenticado {
  id: string;
  email: string;
  tipo: string;
}

export const UsuarioAtual = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UsuarioAutenticado =>
    context.switchToHttp().getRequest<{ user: UsuarioAutenticado }>().user,
);
