import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { UsuarioAtual, UsuarioAutenticado } from '../../common/decorators/usuario-atual.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AtualizarParcelamentoDto, CriarParcelamentoDto, FiltroParcelamentosDto } from './dto/parcelamento.dto';
import { PagarParcelaDto } from './dto/pagar-parcela.dto';
import { ParcelamentosService } from './parcelamentos.service';
import { ParcelasService } from './parcelas.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ParcelamentosController {
  constructor(private readonly contas: ParcelamentosService, private readonly parcelas: ParcelasService) {}

  @Post('contas-parceladas')
  criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dto: CriarParcelamentoDto) { return this.contas.criar(usuario.id, dto); }

  @Get('contas-parceladas')
  listar(@UsuarioAtual() usuario: UsuarioAutenticado, @Query() filtro: FiltroParcelamentosDto) { return this.contas.listar(usuario.id, filtro); }

  @Get('contas-parceladas/:id')
  buscar(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) { return this.contas.buscar(usuario.id, id); }

  @Get('contas-parceladas/:id/parcelas')
  async listarParcelas(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    const conta = await this.contas.buscar(usuario.id, id);
    return conta.parcelas;
  }

  @Patch('contas-parceladas/:id')
  atualizar(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AtualizarParcelamentoDto) {
    return this.contas.atualizar(usuario.id, id, dto);
  }

  @Patch('contas-parceladas/:id/cancelar')
  cancelar(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) { return this.contas.cancelar(usuario.id, id); }

  @Patch('parcelas/:id/pagar')
  @HttpCode(200)
  pagar(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string, @Body() dto: PagarParcelaDto) {
    return this.parcelas.pagar(usuario.id, id, dto.dataPagamento);
  }
}
