import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { TipoUsuario } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioAtual, UsuarioAutenticado } from '../../common/decorators/usuario-atual.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AlterarStatusUsuarioDto, AlterarTipoUsuarioDto, AtualizarUsuarioDto, FiltroUsuariosDto } from './dto/usuario.dto';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Get('me')
  me(@UsuarioAtual() usuario: UsuarioAutenticado) { return this.usuarios.buscar(usuario.id); }

  @Patch('me')
  atualizar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dto: AtualizarUsuarioDto) {
    return this.usuarios.atualizar(usuario.id, dto);
  }

  @Get()
  @Roles(TipoUsuario.ADMINISTRADOR)
  listar(@Query() filtro: FiltroUsuariosDto) { return this.usuarios.listar(filtro); }

  @Patch(':id/status')
  @Roles(TipoUsuario.ADMINISTRADOR)
  status(@UsuarioAtual() admin: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AlterarStatusUsuarioDto) {
    return this.usuarios.alterarStatus(admin.id, id, dto.ativo);
  }

  @Patch(':id/tipo')
  @Roles(TipoUsuario.ADMINISTRADOR)
  tipo(@UsuarioAtual() admin: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AlterarTipoUsuarioDto) {
    return this.usuarios.alterarTipo(admin.id, id, dto.tipo);
  }
}
