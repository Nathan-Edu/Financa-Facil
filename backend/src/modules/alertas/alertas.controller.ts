import { Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { UsuarioAtual, UsuarioAutenticado } from '../../common/decorators/usuario-atual.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AlertasService } from './alertas.service';

@Controller('alertas')
@UseGuards(JwtAuthGuard)
export class AlertasController {
  constructor(private readonly alertas: AlertasService) {}

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado, @Query('perfilId', ParseUUIDPipe) perfilId: string) {
    return this.alertas.listar(usuario.id, perfilId);
  }

  @Patch(':id/lido')
  lido(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return this.alertas.marcarLido(usuario.id, id);
  }

  @Patch('marcar-todos-lidos')
  todos(@UsuarioAtual() usuario: UsuarioAutenticado, @Query('perfilId', ParseUUIDPipe) perfilId: string) {
    return this.alertas.marcarTodosLidos(usuario.id, perfilId);
  }
}
