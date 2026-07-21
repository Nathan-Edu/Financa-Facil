import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsuarioAtual, UsuarioAutenticado } from '../../common/decorators/usuario-atual.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FiltroRelatorioDto } from './dto/filtro-relatorio.dto';
import { RelatoriosService } from './relatorios.service';

@Controller('relatorios')
@UseGuards(JwtAuthGuard)
export class RelatoriosController {
  constructor(private readonly relatorios: RelatoriosService) {}

  @Get('financeiro')
  financeiro(@UsuarioAtual() usuario: UsuarioAutenticado, @Query() filtro: FiltroRelatorioDto) {
    return this.relatorios.financeiro(usuario.id, filtro);
  }
}
