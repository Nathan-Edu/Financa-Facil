import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');

import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { DecimalInterceptor } from '../src/common/interceptors/decimal.interceptor';
import { AlertasService } from '../src/modules/alertas/alertas.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Finança Fácil API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const marcador = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const email = `e2e-${marcador}@financafacil.local`;
  const emailOutro = `e2e-outro-${marcador}@financafacil.local`;
  let token = '';
  let tokenOutro = '';
  let perfilId = '';
  let categoriaId = '';
  let contaId = '';

  const hoje = new Date();
  const dataHoje = hoje.toISOString().slice(0, 10);
  const emTresDias = new Date(hoje);
  emTresDias.setUTCDate(emTresDias.getUTCDate() + 3);
  const vencimento = emTresDias.toISOString().slice(0, 10);

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new DecimalInterceptor());
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    try {
      const usuarios = await prisma.usuario.findMany({
        where: { email: { in: [email, emailOutro] } }, select: { id: true },
      });
      const ids = usuarios.map((usuario) => usuario.id);
      await prisma.logAuditoria.deleteMany({ where: { usuarioId: { in: ids } } });
      await prisma.usuario.deleteMany({ where: { id: { in: ids } } });
    } finally {
      await app.close();
    }
  });

  it('responde no health check', async () => {
    await request(app.getHttpServer()).get('/api/v1/health').expect(200).expect(({ body }) => {
      expect(body.status).toBe('ok');
      expect(body.database).toBe('ok');
    });
  });

  it('cadastra dois usuários e autentica', async () => {
    const cadastro = await request(app.getHttpServer()).post('/api/v1/auth/cadastro').send({
      nome: 'Usuário E2E', email, senha: 'Teste@123',
    }).expect(201);
    token = cadastro.body.accessToken;
    expect(token).toBeTruthy();

    const outro = await request(app.getHttpServer()).post('/api/v1/auth/cadastro').send({
      nome: 'Outro E2E', email: emailOutro, senha: 'Teste@123',
    }).expect(201);
    tokenOutro = outro.body.accessToken;
  });

  it('cria perfil e impede acesso por outro usuário', async () => {
    const resposta = await request(app.getHttpServer()).post('/api/v1/perfis')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Pessoal', tipo: 'PESSOAL', documento: '52998224725', renda: 5000 })
      .expect(201);
    perfilId = resposta.body.id;
    expect(resposta.body.renda).toBe(5000);

    await request(app.getHttpServer()).get(`/api/v1/perfis/${perfilId}`)
      .set('Authorization', `Bearer ${tokenOutro}`)
      .expect(404);
  });

  it('cria categoria e transação paga', async () => {
    const categoria = await request(app.getHttpServer()).post('/api/v1/categorias')
      .set('Authorization', `Bearer ${token}`)
      .send({ perfilId, nome: 'Compras E2E', tipo: 'DESPESA' })
      .expect(201);
    categoriaId = categoria.body.id;

    const transacao = await request(app.getHttpServer()).post('/api/v1/transacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({ perfilId, categoriaId, tipo: 'DESPESA', descricao: 'Despesa E2E', valor: 25, dataCompetencia: dataHoje })
      .expect(201);
    await request(app.getHttpServer()).patch(`/api/v1/transacoes/${transacao.body.id}/pagar`)
      .set('Authorization', `Bearer ${token}`).expect(200);
  });

  it('gera parcelas, alerta e registra pagamento', async () => {
    const conta = await request(app.getHttpServer()).post('/api/v1/contas-parceladas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        perfilId, categoriaId, descricao: 'Compra parcelada E2E', valorTotal: 100,
        quantidadeParcelas: 3, dataCompra: dataHoje, primeiroVencimento: vencimento,
      }).expect(201);
    contaId = conta.body.id;
    expect(conta.body.parcelas.map((item: { valor: number }) => item.valor)).toEqual([33.34, 33.33, 33.33]);

    await app.get(AlertasService).processarVencimentos();
    const alertas = await request(app.getHttpServer()).get(`/api/v1/alertas?perfilId=${perfilId}`)
      .set('Authorization', `Bearer ${token}`).expect(200);
    expect(alertas.body.length).toBeGreaterThan(0);

    await request(app.getHttpServer()).patch(`/api/v1/parcelas/${conta.body.parcelas[0].id}/pagar`)
      .set('Authorization', `Bearer ${token}`).send({ dataPagamento: dataHoje }).expect(200);
  });

  it('calcula dashboard e relatório em regime de caixa', async () => {
    const dashboard = await request(app.getHttpServer()).get(`/api/v1/dashboard/resumo?perfilId=${perfilId}`)
      .set('Authorization', `Bearer ${token}`).expect(200);
    expect(dashboard.body.despesas).toBeCloseTo(58.34, 2);
    expect(dashboard.body.saldo).toBeCloseTo(-58.34, 2);

    const relatorio = await request(app.getHttpServer())
      .get(`/api/v1/relatorios/financeiro?perfilId=${perfilId}&dataInicial=${dataHoje}&dataFinal=${dataHoje}`)
      .set('Authorization', `Bearer ${token}`).expect(200);
    expect(relatorio.body.resumo.despesas).toBeCloseTo(58.34, 2);
  });

  it('preserva parcela paga ao cancelar o restante da conta', async () => {
    await request(app.getHttpServer()).patch(`/api/v1/contas-parceladas/${contaId}/cancelar`)
      .set('Authorization', `Bearer ${token}`).expect(200).expect(({ body }) => {
        expect(body.status).toBe('CANCELADA');
      });
    const parcelas = await request(app.getHttpServer()).get(`/api/v1/contas-parceladas/${contaId}/parcelas`)
      .set('Authorization', `Bearer ${token}`).expect(200);
    expect(parcelas.body.filter((item: { status: string }) => item.status === 'PAGA')).toHaveLength(1);
    expect(parcelas.body.filter((item: { status: string }) => item.status === 'CANCELADA')).toHaveLength(2);
  });

  it('protege rotas administrativas por papel', async () => {
    await request(app.getHttpServer()).get('/api/v1/usuarios')
      .set('Authorization', `Bearer ${token}`).expect(403);
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { email } });
    await prisma.usuario.update({ where: { id: usuario.id }, data: { tipo: 'ADMINISTRADOR' } });
    await request(app.getHttpServer()).get('/api/v1/usuarios')
      .set('Authorization', `Bearer ${token}`).expect(200);
    await prisma.usuario.update({ where: { id: usuario.id }, data: { tipo: 'USUARIO' } });
  });

  it('recupera a senha com token de desenvolvimento e invalida a antiga', async () => {
    const esqueci = await request(app.getHttpServer()).post('/api/v1/auth/esqueci-senha').send({ email }).expect(200);
    expect(esqueci.body.tokenDesenvolvimento).toBeTruthy();
    await request(app.getHttpServer()).post('/api/v1/auth/redefinir-senha')
      .send({ token: esqueci.body.tokenDesenvolvimento, novaSenha: 'Nova@1234' }).expect(204);
    await request(app.getHttpServer()).post('/api/v1/auth/login')
      .send({ email, senha: 'Teste@123' }).expect(401);
    await request(app.getHttpServer()).post('/api/v1/auth/login')
      .send({ email, senha: 'Nova@1234' }).expect(200);
  });
});
