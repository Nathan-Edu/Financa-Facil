import { Controller, Get, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { UsuarioAtual, UsuarioAutenticado } from '../../common/decorators/usuario-atual.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('resumo')
  resumo(@UsuarioAtual() usuario: UsuarioAutenticado, @Query('perfilId', ParseUUIDPipe) perfilId: string) {
    return this.dashboard.resumo(usuario.id, perfilId);
  }
}
