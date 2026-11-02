# Plano de testes

Objetivo: verificar regras financeiras, limites de datas, autorização e regressões corrigidas, sem recriar o sistema nem modificar dados existentes. O resultado se aplica ao estado da branch e ao ambiente descritos, não a uma certificação de produção.

## Ferramentas, ambiente e pré-condições

Windows, Node v24.18.0, npm 11.16.0 e Chrome Headless 156. Jest/ts-jest e Supertest na API; Jasmine/Karma/Angular nas interfaces. Dependências instaladas com `npm.cmd ci --no-audit --no-fund` em cada aplicação, preservando lockfiles. Foi necessário executar `npm.cmd run prisma:generate` explicitamente. Os avisos de scripts de instalação não aprovados do npm constam nos logs; não houve liberação global de scripts.

O PostgreSQL 18.4 foi inicializado em diretório temporário exclusivo, escutando apenas em `127.0.0.1:55439`. Criou-se apenas `financa_tcc_test` nesse servidor novo; as seis migrations foram aplicadas com `prisma migrate deploy`. A autenticação local trust foi usada somente nesse cluster efêmero de loopback. Nenhum banco preexistente foi reutilizado.

`test/ambiente-e2e.ts` é carregado antes do AppModule: exige `E2E_DATABASE_URL`, restringe host a loopback e banco ao prefixo de teste permitido, define segredos sintéticos e desabilita SMTP real. A limpeza do E2E remove somente os usuários gerados por email exclusivo daquela execução e seus logs. Não há `migrate reset`, truncamento global ou exclusão de banco compartilhado.

Os testes unitários usam mocks de Prisma/serviços. Os testes das interfaces usam HttpTestingController, sem servidor externo. Os testes de API usam a aplicação NestJS e PostgreSQL reais, com dados sintéticos. Não são testes de navegação nem de um dispositivo físico. O health check é validado pela integração, não apenas pela existência da rota.

## Casos e resultados esperados

| ID | Tipo | Entradas ou cenário | Resultado esperado | Evidência |
|---|---|---|---|---|
| U01 | Unitário | Total 100 em 3 parcelas | 33,34 + 33,33 + 33,33; total preservado | `parcelamento.utils.spec.ts` |
| U02 | Unitário | Total 1234,57 em 360 parcelas | Soma dos centavos = 123457 | mesmo arquivo |
| U03 | Unitário | 31 de janeiro, fevereiro comum/bissexto, dezembro | Datas limitadas ao mês correto, sem arrasto | mesmo arquivo |
| U04 | Unitário | Zero, negativo, NaN e quantidade fracionária | Rejeição | mesmo arquivo |
| U05 | Unitário | Parcela paga, conta cancelada e disputa de quitação | Rejeição sem auditoria duplicada | `parcelas.service.spec.ts` |
| U06 | Unitário | Último dia do mês e fevereiro bissexto | Limite superior exclusivo correto | `dashboard.service.spec.ts` |
| U07 | Unitário | 30 de fevereiro, intervalo parcial/invertido, texto inválido | BadRequest antes de consultas financeiras | mesmo arquivo |
| U08 | Unitário | Todos os períodos e perfil não autorizado | Sem filtro quando solicitado; acesso recusado antes da consulta | mesmo arquivo |
| U09 | Unitário | Receita 100, despesa 25, parcela paga 33,34 | Despesas 58,34, saldo 41,66 e categorias/evolução coerentes | `relatorios.service.spec.ts` |
| U10 | Unitário | Recorrência mensal, semanal e anual bissexta | Avanço correto e deslocamento do vencimento | `recorrencia.utils.spec.ts` |
| U11 | Unitário | Credencial ausente; token inexistente ou consumido | Respostas de exceção sem alteração de senha | `auth.service.spec.ts` |
| U12 | Unitário | Lista explícita de origens | Preservação dos padrões e separação por vírgula | `cors.config.spec.ts` |
| I01 | API E2E | Health, cadastro, login e refresh concorrente | Banco disponível; autenticação; uma rotação válida | `test/api.e2e-spec.ts` |
| I02 | API E2E | Dois usuários e um perfil | Bloqueio de consultas/pagamentos cruzados | mesmo arquivo |
| I03 | API E2E | Categoria e despesa paga | Persistência correta, Decimal serializado e validação de entrada | mesmo arquivo |
| I04 | API E2E | Conta 100/3, alerta, pagamento e cancelamento | Total preservado; uma paga mantida e duas canceladas | mesmo arquivo |
| I05 | API E2E | Vencimento três dias após pagamento | Relatório de hoje exclui parcela; intervalo com vencimento a inclui | mesmo arquivo |
| I06 | API E2E | Processamento recorrente concorrente, repetido e novo serviço | Duas ocorrências no primeiro processamento e nenhuma duplicada | mesmo arquivo |
| I07 | API E2E | Duas últimas parcelas pagas simultaneamente | Ambas pagas e conta FINALIZADA | mesmo arquivo |
| I08 | API E2E | Usuário comum e depois administrador | 403 e 200 conforme papel consultado no banco | mesmo arquivo |
| I09 | API E2E | Reset antigo, reset concorrente, senha antiga/nova | Token anterior inválido; só um reset aceito; login atualizado | mesmo arquivo |
| F01 | Serviço Angular | Login lembrado/não lembrado, rotação e recusa de refresh | Storage adequado e sessão removida após recusa | `auth.service.spec.ts` em ambas interfaces |
| F02 | Serviço Angular | Token expirado ou malformado | Não autenticado | mesmos arquivos |
| F03 | Serviço Angular | Receitas e seleção de perfil | Contrato HTTP e troca de perfil esperados | testes preexistentes de receita/perfil |
| F04 | Interceptor Angular | 401 externo e URL com prefixo semelhante à API | Nenhum token enviado, renovação ou repetição | `auth.interceptor.spec.ts` em ambas interfaces |
| F05 | Interceptor Angular | 401 da própria API | Renovação e nova tentativa preservadas | mesmos arquivos |

Critérios: comandos com saída zero; asserções sem falhas; ausência de testes ignorados na execução final; preservação dos arquivos originais. Cobertura é informada como medição, sem impor um limiar que o projeto não tinha. Build com aviso é diferenciado de erro. A sincronização nativa não comprova compilação ou execução Android/iOS.

## Reprodução

Executar na pasta indicada, após `npm.cmd ci --no-audit --no-fund`:

```powershell
# backend
npm.cmd run prisma:generate
npm.cmd run build
npm.cmd run lint
npm.cmd run test:cov -- --json --outputFile=../docs/tcc-evidencias/logs/backend-unit.json

# Antes do E2E, criar um PostgreSQL local EXCLUSIVO e vazio.
# Exemplo apenas para o servidor temporário desta revisão:
$env:E2E_DATABASE_URL = 'postgresql://tcc_review@127.0.0.1:55439/financa_tcc_test?schema=public'
$env:DATABASE_URL = $env:E2E_DATABASE_URL
.\node_modules\.bin\prisma.cmd migrate deploy
npm.cmd run test:e2e -- --json --outputFile=../docs/tcc-evidencias/logs/backend-e2e.json

# frontend e depois mobile, dentro de cada aplicação
$env:CHROME_BIN = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm.cmd test -- --watch=false --browsers=ChromeHeadless --code-coverage
npm.cmd run build

# mobile, após o build
npm.cmd run mobile:sync

# raiz: catálogo sem alterar as capturas
node docs/tcc-evidencias/gerar-catalogo.cjs
git diff --check
```

O endereço de exemplo depende de um cluster temporário que deve ser recriado; não é configuração permanente do projeto. Para reproduzir o provisionamento, usar `initdb -D <pasta-temporaria-nova> -U tcc_review -A trust --encoding=UTF8 --locale=C`, depois `pg_ctl -D <mesma-pasta> -l <arquivo-log> -o "-h 127.0.0.1 -p 55439" -w start` e `psql -h 127.0.0.1 -p 55439 -U tcc_review -d postgres -c "CREATE DATABASE financa_tcc_test;"`. Encerrar somente esse cluster com `pg_ctl -D <mesma-pasta> -w stop` ao terminar. Não usar esses comandos em um diretório de banco existente.

A suíte ainda não cobre integralmente os componentes visuais, a emissão SMTP, todos os DTOs, todas as ações administrativas, limites de throttling ou todas as combinações de recorrência. O documento 08 registra o trabalho restante.
