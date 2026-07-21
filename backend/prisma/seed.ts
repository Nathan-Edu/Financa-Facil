import { PrismaClient, TipoUsuario } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const senha = process.env.ADMIN_PASSWORD;
  if (!email || !senha) {
    console.log('ADMIN_EMAIL e ADMIN_PASSWORD não definidos; administrador não criado.');
    return;
  }
  if (senha.length < 8) throw new Error('ADMIN_PASSWORD deve possuir ao menos 8 caracteres');
  await prisma.usuario.upsert({
    where: { email },
    update: { tipo: TipoUsuario.ADMINISTRADOR, ativo: true },
    create: {
      nome: process.env.ADMIN_NAME?.trim() || 'Administrador',
      email,
      senhaHash: await argon2.hash(senha),
      tipo: TipoUsuario.ADMINISTRADOR,
    },
  });
  console.log('Administrador configurado com sucesso.');
}

main().finally(async () => prisma.$disconnect());
