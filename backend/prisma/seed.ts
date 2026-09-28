import {
  FrequenciaRecorrencia,
  PrismaClient,
  StatusContaParcelada,
  StatusParcela,
  StatusTransacao,
  TipoCategoria,
  TipoPerfil,
  TipoTransacao,
  TipoUsuario,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

function hojeSaoPaulo(): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const ano = partes.find((parte) => parte.type === 'year')?.value;
  const mes = partes.find((parte) => parte.type === 'month')?.value;
  const dia = partes.find((parte) => parte.type === 'day')?.value;

  if (!ano || !mes || !dia) {
    throw new Error('Não foi possível determinar a data atual.');
  }

  return `${ano}-${mes}-${dia}`;
}

const FIM_DADOS_TESTE = hojeSaoPaulo();

type UsuarioTeste = {
  nome: string;
  email: string;
  senha: string;
  inicio: string;
  fim: string;
  renda: number;
  documento: string;
};

type CategoriaCriada = {
  id: string;
  nome: string;
};

const USUARIOS_TESTE: UsuarioTeste[] = [
  {
    nome: 'Nathan Eduardo',
    email: 'nathan@teste.com',
    senha: 'Nathan@123456',
    inicio: '2025-01-01',
    fim: FIM_DADOS_TESTE,
    renda: 4700,
    documento: '00000000001',
  },
  {
    nome: 'Eduardo',
    email: 'eduardo@exemplo.com',
    senha: 'Eduardo@123',
    inicio: '2026-01-01',
    fim: FIM_DADOS_TESTE,
    renda: 5200,
    documento: '00000000002',
  },
];

function dataUtc(data: string): Date {
  return new Date(`${data}T12:00:00.000Z`);
}

function dataDoMes(ano: number, mes: number, dia: number): Date {
  return new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0));
}

function dentroDoPeriodo(data: Date, inicio: Date, fim: Date): boolean {
  return data >= inicio && data <= fim;
}

function mesesEntre(inicio: Date, fim: Date): Array<{ ano: number; mes: number }> {
  const meses: Array<{ ano: number; mes: number }> = [];

  let ano = inicio.getUTCFullYear();
  let mes = inicio.getUTCMonth() + 1;

  const fimAno = fim.getUTCFullYear();
  const fimMes = fim.getUTCMonth() + 1;

  while (ano < fimAno || (ano === fimAno && mes <= fimMes)) {
    meses.push({ ano, mes });

    mes += 1;

    if (mes > 12) {
      mes = 1;
      ano += 1;
    }
  }

  return meses;
}

function variacao(base: number, ano: number, mes: number, fator = 0.08): number {
  const semente = ((ano * 37 + mes * 17) % 21) - 10;
  const percentual = (semente / 10) * fator;

  return Number((base * (1 + percentual)).toFixed(2));
}

async function criarCategorias(
  perfilId: string,
): Promise<Record<string, CategoriaCriada>> {
  const categorias = [
    ['Salário', TipoCategoria.RECEITA, '#22c55e', 'payments', null],
    ['Freelance', TipoCategoria.RECEITA, '#16a34a', 'work', null],
    ['Investimentos', TipoCategoria.RECEITA, '#14b8a6', 'trending_up', null],

    // Orçamentos mensais usados para validar Dashboard e Alertas.
    ['Moradia', TipoCategoria.DESPESA, '#ef4444', 'home', 1300],
    ['Alimentação', TipoCategoria.DESPESA, '#f97316', 'restaurant', 1200],
    ['Transporte', TipoCategoria.DESPESA, '#eab308', 'directions_car', 700],
    ['Saúde', TipoCategoria.DESPESA, '#ec4899', 'favorite', 500],
    ['Lazer', TipoCategoria.DESPESA, '#8b5cf6', 'sports_esports', 450],
    ['Contas', TipoCategoria.DESPESA, '#3b82f6', 'receipt_long', 600],
    ['Compras', TipoCategoria.DESPESA, '#6366f1', 'shopping_bag', 900],
  ] as const;

  const resultado: Record<string, CategoriaCriada> = {};

  for (const [nome, tipo, cor, icone, orcamentoMensal] of categorias) {
    const categoria = await prisma.categoria.create({
      data: {
        perfilId,
        nome,
        tipo,
        cor,
        icone,
        ativa: true,
        orcamentoMensal,
      },
    });

    resultado[nome] = {
      id: categoria.id,
      nome: categoria.nome,
    };
  }

  return resultado;
}

async function criarTransacao(
  perfilId: string,
  categoriaId: string,
  tipo: TipoTransacao,
  descricao: string,
  valor: number,
  data: Date,
  observacao?: string,
): Promise<void> {
  await prisma.transacao.create({
    data: {
      perfilId,
      categoriaId,
      tipo,
      descricao,
      valor,
      dataCompetencia: data,
      dataVencimento: data,
      dataPagamento: data,
      status: StatusTransacao.PAGA,
      observacao,
      recorrente: false,
    },
  });
}

async function criarHistoricoMensal(
  usuario: UsuarioTeste,
  perfilId: string,
  categorias: Record<string, CategoriaCriada>,
): Promise<number> {
  const inicio = dataUtc(usuario.inicio);
  const fim = dataUtc(usuario.fim);

  let total = 0;

  for (const { ano, mes } of mesesEntre(inicio, fim)) {
    const salario = dataDoMes(ano, mes, 5);

    if (dentroDoPeriodo(salario, inicio, fim)) {
      await criarTransacao(
        perfilId,
        categorias['Salário'].id,
        TipoTransacao.RECEITA,
        'Salário',
        usuario.renda,
        salario,
      );
      total += 1;
    }

    const aluguel = dataDoMes(ano, mes, 8);

    if (dentroDoPeriodo(aluguel, inicio, fim)) {
      await criarTransacao(
        perfilId,
        categorias['Moradia'].id,
        TipoTransacao.DESPESA,
        'Aluguel',
        usuario.email.startsWith('eduardo') ? 1450 : 1200,
        aluguel,
      );
      total += 1;
    }

    const supermercado1 = dataDoMes(ano, mes, 12);

    if (dentroDoPeriodo(supermercado1, inicio, fim)) {
      await criarTransacao(
        perfilId,
        categorias['Alimentação'].id,
        TipoTransacao.DESPESA,
        'Supermercado',
        variacao(usuario.email.startsWith('eduardo') ? 620 : 560, ano, mes),
        supermercado1,
      );
      total += 1;
    }

    const internet = dataDoMes(ano, mes, 15);

    if (dentroDoPeriodo(internet, inicio, fim)) {
      await criarTransacao(
        perfilId,
        categorias['Contas'].id,
        TipoTransacao.DESPESA,
        'Internet',
        usuario.email.startsWith('eduardo') ? 129.9 : 119.9,
        internet,
      );
      total += 1;
    }

    const energia = dataDoMes(ano, mes, 18);

    if (dentroDoPeriodo(energia, inicio, fim)) {
      await criarTransacao(
        perfilId,
        categorias['Contas'].id,
        TipoTransacao.DESPESA,
        'Energia elétrica',
        variacao(usuario.email.startsWith('eduardo') ? 230 : 190, ano, mes, 0.12),
        energia,
      );
      total += 1;
    }

    const transporte = dataDoMes(ano, mes, 22);

    if (dentroDoPeriodo(transporte, inicio, fim)) {
      await criarTransacao(
        perfilId,
        categorias['Transporte'].id,
        TipoTransacao.DESPESA,
        mes % 2 === 0 ? 'Combustível' : 'Transporte',
        variacao(usuario.email.startsWith('eduardo') ? 430 : 360, ano, mes),
        transporte,
      );
      total += 1;
    }

    const supermercado2 = dataDoMes(ano, mes, 25);

    if (dentroDoPeriodo(supermercado2, inicio, fim)) {
      await criarTransacao(
        perfilId,
        categorias['Alimentação'].id,
        TipoTransacao.DESPESA,
        'Compras do mês',
        variacao(usuario.email.startsWith('eduardo') ? 330 : 290, ano, mes, 0.1),
        supermercado2,
      );
      total += 1;
    }

    const lazer = dataDoMes(ano, mes, 27);

    if (dentroDoPeriodo(lazer, inicio, fim)) {
      await criarTransacao(
        perfilId,
        categorias['Lazer'].id,
        TipoTransacao.DESPESA,
        mes % 3 === 0 ? 'Cinema e lazer' : 'Lazer',
        variacao(usuario.email.startsWith('eduardo') ? 260 : 210, ano, mes),
        lazer,
      );
      total += 1;
    }

    if (mes % 3 === 0) {
      const saude = dataDoMes(ano, mes, 20);

      if (dentroDoPeriodo(saude, inicio, fim)) {
        await criarTransacao(
          perfilId,
          categorias['Saúde'].id,
          TipoTransacao.DESPESA,
          mes % 6 === 0 ? 'Consulta médica' : 'Farmácia',
          mes % 6 === 0 ? 280 : 145,
          saude,
        );
        total += 1;
      }
    }

    if ((ano + mes) % 3 === 0) {
      const freelance = dataDoMes(ano, mes, 10);

      if (dentroDoPeriodo(freelance, inicio, fim)) {
        await criarTransacao(
          perfilId,
          categorias['Freelance'].id,
          TipoTransacao.RECEITA,
          'Freelance',
          variacao(usuario.email.startsWith('eduardo') ? 1200 : 950, ano, mes, 0.18),
          freelance,
        );
        total += 1;
      }
    }

    if (mes % 2 === 0) {
      const investimento = dataDoMes(ano, mes, 9);

      if (dentroDoPeriodo(investimento, inicio, fim)) {
        await criarTransacao(
          perfilId,
          categorias['Investimentos'].id,
          TipoTransacao.RECEITA,
          'Rendimento de investimentos',
          variacao(usuario.email.startsWith('eduardo') ? 420 : 300, ano, mes, 0.16),
          investimento,
        );
        total += 1;
      }
    }

    if (mes === 1 || mes === 7) {
      const compra = dataDoMes(ano, mes, 23);

      if (dentroDoPeriodo(compra, inicio, fim)) {
        await criarTransacao(
          perfilId,
          categorias['Compras'].id,
          TipoTransacao.DESPESA,
          mes === 1 ? 'Compras pessoais' : 'Roupas e acessórios',
          variacao(usuario.email.startsWith('eduardo') ? 520 : 390, ano, mes),
          compra,
        );
        total += 1;
      }
    }
  }

  return total;
}

function adicionarMeses(data: Date, quantidade: number): Date {
  const resultado = new Date(data);
  resultado.setUTCMonth(resultado.getUTCMonth() + quantidade);
  return resultado;
}


async function criarRecorrenciaTeste(
  perfilId: string,
  categoriaId: string,
  valor: number,
  fimHistorico: Date,
): Promise<void> {
  const ano = fimHistorico.getUTCFullYear();
  const mes = fimHistorico.getUTCMonth() + 1;

  const competencia = dataDoMes(ano, mes, 1);

  if (competencia > fimHistorico) {
    return;
  }

  const proximaRecorrencia = adicionarMeses(competencia, 1);
  const recorrenteAte = adicionarMeses(competencia, 3);

  await prisma.transacao.create({
    data: {
      perfilId,
      categoriaId,
      tipo: TipoTransacao.RECEITA,
      descricao: 'Receita recorrente de teste',
      valor,
      dataCompetencia: competencia,
      dataVencimento: competencia,
      dataPagamento: competencia,
      status: StatusTransacao.PAGA,
      observacao: 'Registro recorrente criado automaticamente para testes.',
      recorrente: true,
      frequenciaRecorrencia: FrequenciaRecorrencia.MENSAL,
      recorrenteAte,
      proximaRecorrencia,
    },
  });
}

async function criarContaParcelada(
  perfilId: string,
  categoriaId: string,
  descricao: string,
  valorTotal: number,
  quantidadeParcelas: number,
  dataCompra: Date,
  fimHistorico: Date,
): Promise<void> {
  const valorParcela = Number((valorTotal / quantidadeParcelas).toFixed(2));

  const conta = await prisma.contaParcelada.create({
    data: {
      perfilId,
      categoriaId,
      descricao,
      valorTotal,
      quantidadeParcelas,
      dataCompra,
      status: StatusContaParcelada.ATIVA,
      observacao: 'Registro criado automaticamente para testes.',
    },
  });

  let todasPagas = true;

  for (let numero = 1; numero <= quantidadeParcelas; numero += 1) {
    const vencimento = adicionarMeses(dataCompra, numero - 1);
    const paga = vencimento <= fimHistorico;

    if (!paga) {
      todasPagas = false;
    }

    await prisma.parcela.create({
      data: {
        contaParceladaId: conta.id,
        numero,
        valor:
          numero === quantidadeParcelas
            ? Number(
                (
                  valorTotal -
                  valorParcela * (quantidadeParcelas - 1)
                ).toFixed(2),
              )
            : valorParcela,
        dataVencimento: vencimento,
        dataPagamento: paga ? vencimento : null,
        status: paga ? StatusParcela.PAGA : StatusParcela.PENDENTE,
      },
    });
  }

  if (todasPagas) {
    await prisma.contaParcelada.update({
      where: { id: conta.id },
      data: { status: StatusContaParcelada.FINALIZADA },
    });
  }
}

async function popularUsuario(usuarioTeste: UsuarioTeste): Promise<void> {
  const email = usuarioTeste.email.toLowerCase();

  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: {
      nome: usuarioTeste.nome,
      senhaHash: await argon2.hash(usuarioTeste.senha),
      tipo: TipoUsuario.USUARIO,
      ativo: true,
      tentativasLogin: 0,
      bloqueadoAte: null,
    },
    create: {
      nome: usuarioTeste.nome,
      email,
      senhaHash: await argon2.hash(usuarioTeste.senha),
      tipo: TipoUsuario.USUARIO,
      ativo: true,
    },
  });

  // Limpa somente dados de teste associados a este usuário.
  await prisma.refreshToken.deleteMany({
    where: { usuarioId: usuario.id },
  });

  await prisma.tokenRedefinicaoSenha.deleteMany({
    where: { usuarioId: usuario.id },
  });

  await prisma.logAuditoria.deleteMany({
    where: { usuarioId: usuario.id },
  });

  await prisma.perfilFinanceiro.deleteMany({
    where: { usuarioId: usuario.id },
  });

  const perfil = await prisma.perfilFinanceiro.create({
    data: {
      usuarioId: usuario.id,
      nome: 'Perfil Pessoal',
      tipo: TipoPerfil.PESSOAL,
      documento: usuarioTeste.documento,
      descricao: 'Perfil pessoal criado para testes do Finança Fácil.',
      cor: '#2563eb',
      icone: 'EU',
      renda: usuarioTeste.renda,
      ativo: true,
      selecionado: true,
    },
  });

  const categorias = await criarCategorias(perfil.id);

  const quantidadeTransacoes = await criarHistoricoMensal(
    usuarioTeste,
    perfil.id,
    categorias,
  );

  const fimHistorico = dataUtc(usuarioTeste.fim);

  await criarRecorrenciaTeste(
    perfil.id,
    categorias['Salário'].id,
    usuarioTeste.email.startsWith('eduardo') ? 850 : 650,
    fimHistorico,
  );

  const compraNotebook =
    usuarioTeste.email.startsWith('eduardo')
      ? dataUtc('2026-04-10')
      : dataUtc('2026-03-10');

  if (compraNotebook <= fimHistorico) {
    await criarContaParcelada(
      perfil.id,
      categorias['Compras'].id,
      'Notebook',
      usuarioTeste.email.startsWith('eduardo') ? 4200 : 3600,
      10,
      compraNotebook,
      fimHistorico,
    );
  }

  const compraCelular =
    usuarioTeste.email.startsWith('eduardo')
      ? dataUtc('2026-07-05')
      : dataUtc('2025-11-05');

  if (compraCelular <= fimHistorico) {
    await criarContaParcelada(
      perfil.id,
      categorias['Compras'].id,
      'Celular',
      usuarioTeste.email.startsWith('eduardo') ? 2400 : 2100,
      12,
      compraCelular,
      fimHistorico,
    );
  }

  console.log(
    `✓ ${usuarioTeste.nome}: ${quantidadeTransacoes} transações criadas (${usuarioTeste.inicio} até ${usuarioTeste.fim})`,
  );
}

async function configurarAdministrador(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const senha = process.env.ADMIN_PASSWORD;

  if (!email || !senha) {
    console.log(
      'ℹ ADMIN_EMAIL e ADMIN_PASSWORD não definidos; administrador não criado.',
    );
    return;
  }

  if (senha.length < 8) {
    throw new Error('ADMIN_PASSWORD deve possuir ao menos 8 caracteres');
  }

  await prisma.usuario.upsert({
    where: { email },
    update: {
      tipo: TipoUsuario.ADMINISTRADOR,
      ativo: true,
    },
    create: {
      nome: process.env.ADMIN_NAME?.trim() || 'Administrador',
      email,
      senhaHash: await argon2.hash(senha),
      tipo: TipoUsuario.ADMINISTRADOR,
    },
  });

  console.log('✓ Administrador configurado com sucesso.');
}

async function main(): Promise<void> {
  console.log('Iniciando carga de dados de teste...');

  for (const usuario of USUARIOS_TESTE) {
    await popularUsuario(usuario);
  }

  await configurarAdministrador();

  console.log('Carga de dados de teste concluída.');
  console.log(`Dados gerados até: ${FIM_DADOS_TESTE}`);
  console.log('');
  console.log('Usuários disponíveis:');
  console.log('  nathan@teste.com / Nathan@123456');
  console.log('  eduardo@exemplo.com / Eduardo@123');
}

main()
  .catch((erro) => {
    console.error('Erro ao executar seed:', erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
