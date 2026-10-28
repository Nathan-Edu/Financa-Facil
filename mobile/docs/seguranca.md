# Revisão de dependências — 20/10/2026

Escopo: aplicativo mobile na raiz. O backend e o frontend em `referencia/` são cópias de consulta e não foram alterados nem auditados nesta revisão.

A auditoria inicial encontrou 22 alertas (3 críticos, 14 altos, 4 moderados e 1 baixo). O arquivo `audit-before.json` registra o resultado completo.

Foram atualizadas as dependências transitivas com correção disponível e alinhados os pacotes Angular 20.3.34, CLI e build 20.3.40. O package-lock.json registra as versões resolvidas para instalação reproduzível com `npm ci`.

Pendência conhecida: `braces`, trazido pelo `chokidar` do Karma, possui o aviso https://github.com/advisories/GHSA-vfj7-8cjw-p6xm sem versão corrigida publicada na data da revisão. Os alertas propagados aos dependentes não representam falhas independentes. Essa cadeia pertence às ferramentas de desenvolvimento/testes; não é incluída como dependência de execução do aplicativo. Evitar padrões de arquivos de origem não confiável na execução dos testes. A solução definitiva exige uma correção upstream ou migração planejada do executor de testes. Não foi aplicado `npm audit fix --force`, pois a sugestão envolve regressão de versões principais do Karma e plugins.

A ausência de alertas de produção não certifica a segurança do código nem da API. Login, autorização e operações financeiras com o backend real continuam dependendo de validação integrada.

Resultado final: 6 alertas altos, todos na cadeia de desenvolvimento/testes do Karma (`braces`, `chokidar`, `karma`, `karma-jasmine`, `karma-jasmine-html-reporter` e alerta propagado a `@angular/build`). Nenhum alerta crítico restante. `npm audit --omit=dev` retornou zero vulnerabilidades conhecidas. Relatórios completos: `audit-after.json` e `audit-production.json` na raiz.
