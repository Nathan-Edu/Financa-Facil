import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';

import { UsuarioAtual, UsuarioAutenticado } from '../../common/decorators/usuario-atual.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AtualizarPerfilDto, AtualizarRendaDto } from './dto/atualizar-perfil.dto';
import { CriarPerfilDto } from './dto/criar-perfil.dto';
import { PerfisService } from './perfis.service';

@Controller('perfis')
@UseGuards(JwtAuthGuard)
export class PerfisController {
  constructor(private readonly perfis: PerfisService) {}

  @Post()
  criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dto: CriarPerfilDto) {
    return this.perfis.criar(usuario.id, dto);
  }

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.perfis.listar(usuario.id);
  }

  @Get(':id')
  buscar(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return this.perfis.buscar(usuario.id, id);
  }

  @Patch(':id')
  atualizar(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AtualizarPerfilDto) {
    return this.perfis.atualizar(usuario.id, id, dto);
  }

  @Patch(':id/renda')
  renda(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AtualizarRendaDto) {
    return this.perfis.atualizar(usuario.id, id, { renda: dto.renda });
  }

  @Patch(':id/ativar')
  ativar(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return this.perfis.ativar(usuario.id, id);
  }

  @Delete(':id')
  @HttpCode(204)
  excluir(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return this.perfis.excluir(usuario.id, id);
  }
}
