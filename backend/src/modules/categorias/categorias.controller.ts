import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { UsuarioAtual, UsuarioAutenticado } from '../../common/decorators/usuario-atual.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriasService } from './categorias.service';
import { AtualizarCategoriaDto, CriarCategoriaDto } from './dto/categoria.dto';

@Controller('categorias')
@UseGuards(JwtAuthGuard)
export class CategoriasController {
  constructor(private readonly categorias: CategoriasService) {}

  @Post()
  criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dto: CriarCategoriaDto) {
    return this.categorias.criar(usuario.id, dto);
  }

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado, @Query('perfilId', ParseUUIDPipe) perfilId: string) {
    return this.categorias.listar(usuario.id, perfilId);
  }

  @Patch(':id')
  atualizar(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AtualizarCategoriaDto) {
    return this.categorias.atualizar(usuario.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  excluir(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return this.categorias.excluir(usuario.id, id);
  }
}
