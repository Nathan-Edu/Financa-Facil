// Executar na raiz, depois dos comandos documentados em 04-plano-de-testes.md.
// Apenas resume artefatos efetivamente produzidos. Não executa nem simula testes.
const fs = require('node:fs');
const path = require('node:path');
const { createCoverageMap } = require('../../backend/node_modules/istanbul-lib-coverage');
const pasta = __dirname;
const logs = path.join(pasta, 'logs');
function texto(nome) {
  const b = fs.readFileSync(path.join(logs, nome));
  return (b[0] === 255 && b[1] === 254 ? b.subarray(2).toString('utf16le') : b.toString('utf8')).replace(/^\uFEFF/, '');
}
const unit = JSON.parse(texto('backend-unit.json'));
const e2e = JSON.parse(texto('backend-e2e.json'));
const cobertura = createCoverageMap(JSON.parse(fs.readFileSync('backend/coverage/coverage-final.json', 'utf8'))).getCoverageSummary().toJSON();
fs.writeFileSync(path.join(logs, 'backend-cobertura.json'), JSON.stringify(cobertura, null, 2) + '\n');
const linhas = [
  '# Resultados reais das execuções', '',
  'Data local: 01/11/2026 (America/Sao_Paulo). Algumas ferramentas imprimem 02/11 em UTC. Base analisada: `d479a3b`, com as alterações locais descritas no documento 09. Não foi criado commit de revisão.', '',
  '| ID | Tipo | Funcionalidade | Resultado esperado | Resultado obtido | Situação |',
  '|---|---|---|---|---|---|',
];
let total = 0, aprovados = 0, reprovados = 0, ignorados = 0;
for (const [id, nome, r, arquivo] of [['T01', 'Unitários backend', unit, 'backend-unit'], ['T02', 'API E2E com PostgreSQL isolado', e2e, 'backend-e2e']]) {
  total += r.numTotalTests; aprovados += r.numPassedTests; reprovados += r.numFailedTests; ignorados += r.numPendingTests;
  linhas.push(`| ${id} | ${nome} | Regras e regressões | Todas as asserções válidas | ${r.numTotalTests} casos: ${r.numPassedTests} aprovados, ${r.numFailedTests} reprovados, ${r.numPendingTests} ignorados | ${r.success ? 'Aprovado' : 'Reprovado'}; [JSON](logs/${arquivo}.json) / [log](logs/${arquivo}.txt) |`);
}
const coberturasInterfaces = [];
for (const [id, app] of [['T03', 'frontend'], ['T04', 'mobile']]) {
  const raw = texto(`${app}-tests.txt`).replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
  const m = raw.match(/TOTAL:\s*(\d+) SUCCESS/);
  if (!m) throw new Error(`Resumo de testes não encontrado: ${app}`);
  const n = Number(m[1]); total += n; aprovados += n;
  linhas.push(`| ${id} | Serviços/interceptors Angular (${app}) | HTTP, sessão, perfil e interceptor | Todas as asserções válidas | ${n} executados e aprovados; 0 reprovados e 0 ignorados | Aprovado; [log](logs/${app}-tests.txt) |`);
  const metricas = {};
  for (const chave of ['Statements', 'Branches', 'Functions', 'Lines']) {
    const match = raw.match(new RegExp(`${chave}\\s*:\\s*([\\d.]+)%\\s*\\(\\s*(\\d+)\\/(\\d+)\\s*\\)`));
    if (!match) throw new Error(`Cobertura ausente: ${app}/${chave}`);
    metricas[chave] = `${match[1]}% (${match[2]}/${match[3]})`;
  }
  coberturasInterfaces.push([app, metricas]);
}
for (const [id, nome, arquivo] of [
  ['V01', 'Build backend', 'backend-build'], ['V02', 'Lint backend', 'backend-lint'],
  ['V03', 'Build frontend', 'frontend-build'], ['V04', 'Build mobile', 'mobile-build'],
  ['V05', 'Sincronização Capacitor', 'mobile-sync'],
]) {
  const codigo = texto(`${arquivo}-exit.txt`).match(/exit=(\d+)/)?.[1];
  if (codigo === undefined) throw new Error(`Código de saída ausente: ${arquivo}`);
  linhas.push(`| ${id} | Validação de ferramenta | ${nome} | Saída 0 | Saída ${codigo}${id === 'V05' ? '; iOS sem CocoaPods/Xcode' : ''} | ${codigo === '0' ? 'Aprovado' : 'Reprovado'}${id === 'V05' ? ' com limitação nativa' : ''}; [log](logs/${arquivo}.txt) |`);
}
linhas.push('', `Execução final: **${total} testes, ${aprovados} aprovados, ${reprovados} reprovados, ${ignorados} ignorados**. Contagem por casos das suítes; não representa quantidade de usuários, telas ou requisitos. Builds, lint e sync não entram nessa soma. Não se somam as reexecuções como novos casos.`, '',
  '## Cobertura medida', '',
  '| Conjunto | Statements | Branches | Functions | Lines |', '|---|---|---|---|---|');
const cell = (chave) => `${cobertura[chave].pct}% (${cobertura[chave].covered}/${cobertura[chave].total})`;
linhas.push(`| Backend, unitários | ${cell('statements')} | ${cell('branches')} | ${cell('functions')} | ${cell('lines')} |`);
for (const [app, c] of coberturasInterfaces) linhas.push(`| ${app}, serviços/interceptors carregados | ${c.Statements} | ${c.Branches} | ${c.Functions} | ${c.Lines} |`);
linhas.push('',
  'A cobertura do backend vem do Istanbul `backend/coverage/coverage-final.json`, com resumo preservado em [logs/backend-cobertura.json](logs/backend-cobertura.json), abrangendo `src/**/*.ts` exceto main conforme configuração Jest. A cobertura das interfaces é a impressa por Karma, sobre arquivos carregados pelos testes; não representa toda a aplicação Angular. A API E2E não teve cobertura instrumental calculada. Não se combinam percentuais entre plataformas.', '',
  '## Falhas intermediárias e correções', '',
  '- Primeira execução E2E: 12 casos reportados como falhos por timeout do `beforeAll` de 5 segundos. Não eram 12 defeitos funcionais independentes. O hook passou a permitir 60 segundos para inicialização e a suíte usa 30 segundos por teste. Log e JSON preservados como `backend-e2e-tentativa1.*`.',
  '- Primeiro lint: uma asserção de tipo desnecessária no teste de autenticação. Corrigida sem relaxar regra do lint; log em `backend-lint-tentativa1.txt`.',
  '- Primeiro build mobile: stylesheet dos relatórios excedia o limite de erro de 12 kB (12,38 kB). Foram removidos seletores não utilizados pelo template; o limite permaneceu igual. Log em `mobile-build-tentativa1.txt`.',
  '- Execuções intermediárias aprovadas foram preservadas com sufixos `tentativa1` e `tentativa2` antes de ampliar os cenários. Os arquivos sem sufixo são o estado final.', '',
  '## Avisos e limites da validação', '',
  'Os builds frontend e mobile concluíram com avisos de tamanho de estilos; o mobile também avisou sobre bundle inicial acima do limite de aviso. O sync retornou zero, mas pulou instalação de CocoaPods e limpeza Xcode. Não houve compilação, assinatura ou instalação nativa. Os primeiros logs Karma registraram encerramento forçado do processo Chrome após sucesso dos testes; os códigos de saída foram zero.', '',
  'As dependências foram instaladas sem atualizar lockfiles. Não foi realizada auditoria completa de vulnerabilidades de dependências. Não houve teste de navegação, desempenho, acessibilidade integral, SMTP real ou banco compartilhado.', '');
fs.writeFileSync(path.join(pasta, '05-resultados-testes.md'), linhas.join('\n'));
