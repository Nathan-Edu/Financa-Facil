import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService: credenciais e redefinição', () => {
  function preparar() {
    const tx = {
      tokenRedefinicaoSenha: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
      usuario: { update: jest.fn() }, refreshToken: { updateMany: jest.fn() },
    };
    const prisma = {
      usuario: { findUnique: jest.fn().mockResolvedValue(null) },
      tokenRedefinicaoSenha: { findUnique: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
    };
    const service = new AuthService(prisma as never, {} as never, {} as never, {} as never);
    return { service, prisma, tx };
  }

  it('rejeita usuário inexistente sem revelar se o email está cadastrado', async () => {
    const { service } = preparar();
    await expect(service.login({ email: 'ausente@example.invalid', senha: 'sintetica' })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejeita redefinição com token inexistente sem abrir transação', async () => {
    const { service, prisma } = preparar();
    await expect(service.redefinirSenha('token-sintetico', 'SenhaSintetica@123')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('impede redefinição quando outro processo já consumiu o token', async () => {
    const { service, prisma, tx } = preparar();
    prisma.tokenRedefinicaoSenha.findUnique.mockResolvedValue({
      id: 'token', usuarioId: 'usuario', utilizadoEm: null, expiraEm: new Date(Date.now() + 60000),
    });
    await expect(service.redefinirSenha('token-sintetico', 'SenhaSintetica@123')).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.usuario.update).not.toHaveBeenCalled();
    expect(tx.refreshToken.updateMany).not.toHaveBeenCalled();
  });
});
