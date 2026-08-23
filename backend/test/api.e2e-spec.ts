import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');

import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { DecimalInterceptor } from '../src/common/interceptors/decimal.interceptor';
import { AlertasService } from '../src/modules/alertas/alertas.service';
import { TransacoesService } from '../src/modules/transacoes/transacoes.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Finança Fácil API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const marcador = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const email = `e2e-${marcador}@financafacil.local`;
  const emailOutro = `e2e-outro-${marcador}@financafacil.local`;
  let token = '';
  let refreshInicial = '';
  let refreshAtual = '';
  let tokenOutro = '';
  let perfilId = '';
  let categoriaId = '';
  let contaId = '';

  const hoje = new Date();
  const dataHoje = hoje.toISOString().slice(0, 10);
  const emTresDias = new Date(hoje);
  emTresDias.setUTCDate(emTresDias.getUTCDate() + 3);
  const vencimento = emTresDias.toISOString().slice(0, 10);
  const haQuinzeDias = new Date(hoje);
  haQuinzeDias.setUTCDate(haQuinzeDias.getUTCDate() - 15);
  const dataHaQuinzeDias = haQuinzeDias.toISOString().slice(0, 10);

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
    refreshInicial = cadastro.body.refreshToken;
    expect(token).toBeTruthy();

    const loginImediato = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email, senha: 'Teste@123',
    }).expect(200);
    expect(loginImediato.body.refreshToken).not.toBe(refreshInicial);
    token = loginImediato.body.accessToken;
    refreshAtual = loginImediato.body.refreshToken;

    const outro = await request(app.getHttpServer()).post('/api/v1/auth/cadastro').send({
      nome: 'Outro E2E', email: emailOutro, senha: 'Teste@123',
    }).expect(201);
    tokenOutro = outro.body.accessToken;
  });

  it('permite apenas uma rotação concorrente do mesmo refresh token', async () => {
    const respostas = await Promise.all([
      request(app.getHttpServer()).post('/api/v1/auth/refresh').send({ refreshToken: refreshAtual }),
      request(app.getHttpServer()).post('/api/v1/auth/refresh').send({ refreshToken: refreshAtual }),
    ]);
    expect(respostas.map((resposta) => resposta.status).sort()).toEqual([200, 401]);
    const sucesso = respostas.find((resposta) => resposta.status === 200)!;
    token = sucesso.body.accessToken;
    refreshAtual = sucesso.body.refreshToken;
  });

  it('cria perfil e impede acesso por outro usuário', async () => {
    const resposta = await request(app.getHttpServer()).post('/api/v1/perfis')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Pessoal', tipo: 'PESSOAL', documento: '52998224725', renda: 5000, descricao: 'Perfil E2E', cor: '#123456', icone: 'PE' })
      .expect(201);
    perfilId = resposta.body.id;
    expect(resposta.body.renda).toBe(5000);
    expect(resposta.body.descricao).toBe('Perfil E2E');
    expect(resposta.body.cor).toBe('#123456');

    await request(app.getHttpServer()).get(`/api/v1/perfis/${perfilId}`)
      .set('Authorization', `Bearer ${tokenOutro}`)
      .expect(404);
  });

  it('cria categoria e transação paga', async () => {
    const categoria = await request(app.getHttpServer()).post('/api/v1/categorias')
      .set('Authorization', `Bearer ${token}`)
      .send({ perfilId, nome: 'Compras E2E', tipo: 'DESPESA', icone: 'shopping_cart', cor: '#654321', orcamentoMensal: 300 })
      .expect(201);
    categoriaId = categoria.body.id;
    expect(categoria.body.orcamentoMensal).toBe(300);

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
    await request(app.getHttpServer()).patch(`/api/v1/alertas/${alertas.body[0].id}`)
      .set('Authorization', `Bearer ${token}`).send({ descartado: true, lido: false }).expect(200)
      .expect(({ body }) => expect(body.descartado).toBe(true));

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
    expect(relatorio.body.movimentacoes).toHaveLength(2);
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

  it('gera e recupera ocorrências recorrentes sem duplicar', async () => {
    await request(app.getHttpServer()).post('/api/v1/transacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        perfilId, categoriaId, tipo: 'DESPESA', descricao: 'Recorrente E2E', valor: 10,
        dataCompetencia: dataHaQuinzeDias, recorrente: true, frequenciaRecorrencia: 'SEMANAL',
      }).expect(201);

    const primeiraExecucao = await app.get(TransacoesService).processarRecorrencias();
    const segundaExecucao = await app.get(TransacoesService).processarRecorrencias();
    expect(primeiraExecucao.geradas).toBe(2);
    expect(segundaExecucao.geradas).toBe(0);

    await request(app.getHttpServer())
      .get(`/api/v1/transacoes?perfilId=${perfilId}&tipo=DESPESA&status=PENDENTE&busca=Recorrente%20E2E&limit=100`)
      .set('Authorization', `Bearer ${token}`).expect(200)
      .expect(({ body }) => expect(body.meta.total).toBe(3));
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
    const primeiro = await request(app.getHttpServer()).post('/api/v1/auth/esqueci-senha').send({ email }).expect(200);
    const esqueci = await request(app.getHttpServer()).post('/api/v1/auth/esqueci-senha').send({ email }).expect(200);
    expect(primeiro.body.tokenDesenvolvimento).toBeTruthy();
    expect(esqueci.body.tokenDesenvolvimento).toBeTruthy();
    await request(app.getHttpServer()).post('/api/v1/auth/redefinir-senha')
      .send({ token: primeiro.body.tokenDesenvolvimento, novaSenha: 'Ignorada@1234' }).expect(400);
    await request(app.getHttpServer()).post('/api/v1/auth/redefinir-senha')
      .send({ token: esqueci.body.tokenDesenvolvimento, novaSenha: 'Nova@1234' }).expect(204);
    await request(app.getHttpServer()).post('/api/v1/auth/login')
      .send({ email, senha: 'Teste@123' }).expect(401);
    await request(app.getHttpServer()).post('/api/v1/auth/login')
      .send({ email, senha: 'Nova@1234' }).expect(200);
  });
});
