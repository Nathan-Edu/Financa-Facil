# Resultados reais das execuções

Data local: 01/11/2026 (America/Sao_Paulo). Algumas ferramentas imprimem 02/11 em UTC. Base analisada: `d479a3b`, com as alterações locais descritas no documento 09. Não foi criado commit de revisão.

| ID | Tipo | Funcionalidade | Resultado esperado | Resultado obtido | Situação |
|---|---|---|---|---|---|
| T01 | Unitários backend | Regras e regressões | Todas as asserções válidas | 32 casos: 32 aprovados, 0 reprovados, 0 ignorados | Aprovado; [JSON](logs/backend-unit.json) / [log](logs/backend-unit.txt) |
| T02 | API E2E com PostgreSQL isolado | Regras e regressões | Todas as asserções válidas | 13 casos: 13 aprovados, 0 reprovados, 0 ignorados | Aprovado; [JSON](logs/backend-e2e.json) / [log](logs/backend-e2e.txt) |
| T03 | Serviços/interceptors Angular (frontend) | HTTP, sessão, perfil e interceptor | Todas as asserções válidas | 10 executados e aprovados; 0 reprovados e 0 ignorados | Aprovado; [log](logs/frontend-tests.txt) |
| T04 | Serviços/interceptors Angular (mobile) | HTTP, sessão, perfil e interceptor | Todas as asserções válidas | 10 executados e aprovados; 0 reprovados e 0 ignorados | Aprovado; [log](logs/mobile-tests.txt) |
| V01 | Validação de ferramenta | Build backend | Saída 0 | Saída 0 | Aprovado; [log](logs/backend-build.txt) |
| V02 | Validação de ferramenta | Lint backend | Saída 0 | Saída 0 | Aprovado; [log](logs/backend-lint.txt) |
| V03 | Validação de ferramenta | Build frontend | Saída 0 | Saída 0 | Aprovado; [log](logs/frontend-build.txt) |
| V04 | Validação de ferramenta | Build mobile | Saída 0 | Saída 0 | Aprovado; [log](logs/mobile-build.txt) |
| V05 | Validação de ferramenta | Sincronização Capacitor | Saída 0 | Saída 0; iOS sem CocoaPods/Xcode | Aprovado com limitação nativa; [log](logs/mobile-sync.txt) |

Execução final: **65 testes, 65 aprovados, 0 reprovados, 0 ignorados**. Contagem por casos das suítes; não representa quantidade de usuários, telas ou requisitos. Builds, lint e sync não entram nessa soma. Não se somam as reexecuções como novos casos.

## Cobertura medida

| Conjunto | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| Backend, unitários | 18.7% (232/1240) | 20.88% (71/340) | 18.95% (40/211) | 19.25% (207/1075) |
| frontend, serviços/interceptors carregados | 51.54% (100/194) | 42.1% (32/76) | 39.39% (39/99) | 53.07% (95/179) |
| mobile, serviços/interceptors carregados | 51.29% (99/193) | 42.85% (30/70) | 39.39% (39/99) | 52.8% (94/178) |

A cobertura do backend vem do Istanbul `backend/coverage/coverage-final.json`, com resumo preservado em [logs/backend-cobertura.json](logs/backend-cobertura.json), abrangendo `src/**/*.ts` exceto main conforme configuração Jest. A cobertura das interfaces é a impressa por Karma, sobre arquivos carregados pelos testes; não representa toda a aplicação Angular. A API E2E não teve cobertura instrumental calculada. Não se combinam percentuais entre plataformas.

## Falhas intermediárias e correções

- Primeira execução E2E: 12 casos reportados como falhos por timeout do `beforeAll` de 5 segundos. Não eram 12 defeitos funcionais independentes. O hook passou a permitir 60 segundos para inicialização e a suíte usa 30 segundos por teste. Log e JSON preservados como `backend-e2e-tentativa1.*`.
- Primeiro lint: uma asserção de tipo desnecessária no teste de autenticação. Corrigida sem relaxar regra do lint; log em `backend-lint-tentativa1.txt`.
- Primeiro build mobile: stylesheet dos relatórios excedia o limite de erro de 12 kB (12,38 kB). Foram removidos seletores não utilizados pelo template; o limite permaneceu igual. Log em `mobile-build-tentativa1.txt`.
- Execuções intermediárias aprovadas foram preservadas com sufixos `tentativa1` e `tentativa2` antes de ampliar os cenários. Os arquivos sem sufixo são o estado final.

## Avisos e limites da validação

Os builds frontend e mobile concluíram com avisos de tamanho de estilos; o mobile também avisou sobre bundle inicial acima do limite de aviso. O sync retornou zero, mas pulou instalação de CocoaPods e limpeza Xcode. Não houve compilação, assinatura ou instalação nativa. Os primeiros logs Karma registraram encerramento forçado do processo Chrome após sucesso dos testes; os códigos de saída foram zero.

As dependências foram instaladas sem atualizar lockfiles. Não foi realizada auditoria completa de vulnerabilidades de dependências. Não houve teste de navegação, desempenho, acessibilidade integral, SMTP real ou banco compartilhado.
