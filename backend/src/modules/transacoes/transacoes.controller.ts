import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { UsuarioAtual, UsuarioAutenticado } from '../../common/decorators/usuario-atual.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AtualizarTransacaoDto, CriarTransacaoDto, FiltroTransacoesDto } from './dto/transacao.dto';
import { TransacoesService } from './transacoes.service';

@Controller('transacoes')
@UseGuards(JwtAuthGuard)
export class TransacoesController {
  constructor(private readonly transacoes: TransacoesService) {}

  @Post()
  criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dto: CriarTransacaoDto) {
    return this.transacoes.criar(usuario.id, dto);
  }

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioAutenticado, @Query() filtro: FiltroTransacoesDto) {
    return this.transacoes.listar(usuario.id, filtro);
  }

  @Get(':id')
  buscar(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return this.transacoes.buscar(usuario.id, id);
  }

  @Patch(':id')
  atualizar(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AtualizarTransacaoDto) {
    return this.transacoes.atualizar(usuario.id, id, dto);
  }

  @Patch(':id/pagar')
  pagar(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return this.transacoes.pagar(usuario.id, id);
  }

  @Delete(':id')
  @HttpCode(204)
  excluir(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return this.transacoes.excluir(usuario.id, id);
  }
}
