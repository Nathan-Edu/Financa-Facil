import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';

import {
  UsuarioAtual,
  UsuarioAutenticado
} from '../../common/decorators/usuario-atual.decorator';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { AlertasService } from './alertas.service';

import { AtualizarAlertaDto } from './dto/atualizar-alerta.dto';


@Controller('alertas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertasController {

  constructor(
    private readonly alertas: AlertasService
  ) {}


  @Get()
  listar(
    @UsuarioAtual()
    usuario: UsuarioAutenticado,

    @Query('perfilId', ParseUUIDPipe)
    perfilId: string
  ) {

    return this.alertas.listar(
      usuario.id,
      perfilId
    );

  }


  // =====================================================
  // PROCESSAMENTO MANUAL
  // =====================================================

  @Post('processar')
  processar() {

    return this.alertas.processarAlertas();

  }


  // =====================================================
  // MARCAR TODOS COMO LIDOS
  // =====================================================

  @Patch('marcar-todos-lidos')
  todos(
    @UsuarioAtual()
    usuario: UsuarioAutenticado,

    @Query('perfilId', ParseUUIDPipe)
    perfilId: string
  ) {

    return this.alertas.marcarTodosLidos(
      usuario.id,
      perfilId
    );

  }


  // =====================================================
  // MARCAR UM ALERTA COMO LIDO
  // =====================================================

  @Patch(':id/lido')
  lido(
    @UsuarioAtual()
    usuario: UsuarioAutenticado,

    @Param('id', ParseUUIDPipe)
    id: string
  ) {

    return this.alertas.marcarLido(
      usuario.id,
      id
    );

  }


  // =====================================================
  // ATUALIZAR ALERTA
  // =====================================================

  @Patch(':id')
  atualizar(
    @UsuarioAtual()
    usuario: UsuarioAutenticado,

    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: AtualizarAlertaDto
  ) {

    return this.alertas.atualizar(
      usuario.id,
      id,
      dto
    );

  }

}