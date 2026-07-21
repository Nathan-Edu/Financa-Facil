import { Body, Controller, Get, HttpCode, Patch, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { UsuarioAtual, UsuarioAutenticado } from '../../common/decorators/usuario-atual.decorator';
import { AuthService } from './auth.service';
import { CadastroDto } from './dto/cadastro.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AlterarSenhaDto, EsqueciSenhaDto, RedefinirSenhaDto } from './dto/senha.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('cadastro')
  cadastrar(@Body() dto: CadastroDto) {
    return this.auth.cadastrar(dto);
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.renovar(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Body() dto: RefreshTokenDto) {
    return this.auth.logout(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return usuario;
  }

  @Patch('alterar-senha')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  alterarSenha(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dto: AlterarSenhaDto) {
    return this.auth.alterarSenha(usuario.id, dto.senhaAtual, dto.novaSenha);
  }

  @Post('esqueci-senha')
  @HttpCode(200)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  esqueciSenha(@Body() dto: EsqueciSenhaDto) {
    return this.auth.esqueciSenha(dto.email);
  }

  @Post('redefinir-senha')
  @HttpCode(204)
  redefinirSenha(@Body() dto: RedefinirSenhaDto) {
    return this.auth.redefinirSenha(dto.token, dto.novaSenha);
  }
}
