import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from '@prisma/client';
import * as argon2 from 'argon2';
import { createHash, randomBytes, randomUUID } from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';
import { CadastroDto } from './dto/cadastro.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  async cadastrar(dto: CadastroDto) {
    const email = dto.email.trim().toLowerCase();
    const existente = await this.prisma.usuario.findUnique({ where: { email } });
    if (existente) throw new ConflictException('E-mail já cadastrado');

    const usuario = await this.prisma.usuario.create({
      data: { nome: dto.nome.trim(), email, senhaHash: await argon2.hash(dto.senha) },
    });
    return this.criarSessao(usuario);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario || !usuario.ativo) throw new UnauthorizedException('Credenciais inválidas');

    if (usuario.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
      throw new UnauthorizedException(`Conta bloqueada temporariamente até ${usuario.bloqueadoAte.toISOString()}`);
    }

    if (!(await argon2.verify(usuario.senhaHash, dto.senha))) {
      await this.registrarFalha(usuario);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const atualizado = await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { tentativasLogin: 0, bloqueadoAte: null, ultimoLoginEm: new Date() },
    });
    return this.criarSessao(atualizado);
  }

  async renovar(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const registro = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashToken(refreshToken) },
      include: { usuario: true },
    });
    if (!registro || !registro.usuario.ativo || registro.revogadoEm || registro.expiraEm <= new Date() || registro.usuarioId !== payload.sub) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const revogado = await this.prisma.refreshToken.updateMany({
      where: { id: registro.id, revogadoEm: null },
      data: { revogadoEm: new Date() },
    });
    if (revogado.count !== 1) throw new UnauthorizedException('Refresh token invÃ¡lido ou expirado');
    return this.criarSessao(registro.usuario);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hashToken(refreshToken), revogadoEm: null },
      data: { revogadoEm: new Date() },
    });
  }

  async alterarSenha(usuarioId: string, senhaAtual: string, novaSenha: string): Promise<void> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario || !(await argon2.verify(usuario.senhaHash, senhaAtual))) {
      throw new UnauthorizedException('Senha atual incorreta');
    }
    await this.prisma.$transaction([
      this.prisma.usuario.update({ where: { id: usuarioId }, data: { senhaHash: await argon2.hash(novaSenha) } }),
      this.prisma.refreshToken.updateMany({ where: { usuarioId, revogadoEm: null }, data: { revogadoEm: new Date() } }),
    ]);
  }

  async esqueciSenha(emailInformado: string) {
    const email = emailInformado.trim().toLowerCase();
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    const mensagem = 'Se o e-mail estiver cadastrado, as instruções serão enviadas';
    if (!usuario?.ativo) return { message: mensagem };

    const token = randomBytes(32).toString('hex');
    const agora = new Date();
    await this.prisma.$transaction([
      this.prisma.tokenRedefinicaoSenha.updateMany({
        where: { usuarioId: usuario.id, utilizadoEm: null },
        data: { utilizadoEm: agora },
      }),
      this.prisma.tokenRedefinicaoSenha.create({
        data: {
          usuarioId: usuario.id,
          tokenHash: this.hashToken(token),
          expiraEm: new Date(agora.getTime() + 30 * 60_000),
        },
      }),
    ]);
    const enviado = await this.mail.enviarRedefinicao(email, token);
    return {
      message: mensagem,
      ...(this.config.get('NODE_ENV') !== 'production' && !enviado ? { tokenDesenvolvimento: token } : {}),
    };
  }

  async redefinirSenha(token: string, novaSenha: string): Promise<void> {
    const registro = await this.prisma.tokenRedefinicaoSenha.findUnique({
      where: { tokenHash: this.hashToken(token) },
    });
    if (!registro || registro.utilizadoEm || registro.expiraEm <= new Date()) {
      throw new BadRequestException('Token inválido ou expirado');
    }
    const agora = new Date();
    await this.prisma.$transaction([
      this.prisma.usuario.update({ where: { id: registro.usuarioId }, data: { senhaHash: await argon2.hash(novaSenha) } }),
      this.prisma.tokenRedefinicaoSenha.updateMany({
        where: { usuarioId: registro.usuarioId, utilizadoEm: null },
        data: { utilizadoEm: agora },
      }),
      this.prisma.refreshToken.updateMany({ where: { usuarioId: registro.usuarioId, revogadoEm: null }, data: { revogadoEm: agora } }),
    ]);
  }

  private async registrarFalha(usuario: Usuario): Promise<void> {
    const tentativas = usuario.tentativasLogin + 1;
    const limite = this.config.get<number>('LOGIN_MAX_ATTEMPTS', 5);
    const minutos = this.config.get<number>('LOGIN_LOCK_MINUTES', 30);
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        tentativasLogin: tentativas >= limite ? 0 : tentativas,
        bloqueadoAte: tentativas >= limite ? new Date(Date.now() + minutos * 60_000) : null,
      },
    });
  }

  private async criarSessao(usuario: Usuario) {
    const payload = { sub: usuario.id, email: usuario.email, tipo: usuario.tipo };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as never,
    });
    const refreshToken = await this.jwt.signAsync({ sub: usuario.id, jti: randomUUID() }, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as never,
    });
    const decoded = await this.jwt.verifyAsync<{ exp: number }>(refreshToken, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
    await this.prisma.refreshToken.create({
      data: {
        usuarioId: usuario.id,
        tokenHash: this.hashToken(refreshToken),
        expiraEm: new Date(decoded.exp * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo },
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
