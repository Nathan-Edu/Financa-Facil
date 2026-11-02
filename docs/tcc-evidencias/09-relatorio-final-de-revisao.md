# Relatório final de revisão técnica

Revisão executada em 01/11/2026 sobre a base `d479a3b` (Ajustes Tecnicos V03), branch local `revisao/validacao-tecnica-tcc`. As alterações permanecem locais, sem commit, push ou alteração da main. Os arquivos não rastreados herdados do projeto anterior foram preservados. O inventário da revisão e o estado final estão em `logs/arquivos-revisao.txt` e `logs/estado-final.txt`.

## Problemas e correções implementadas

| Problema comprovado | Correção | Evidência |
|---|---|---|
| O interceptor repetia requisição externa após 401 com o token da API; `startsWith(API_URL)` também aceitava prefixos semelhantes | Limitar envio, refresh e repetição à fronteira da URL da API em web e mobile | Testes com domínio externo, prefixo semelhante e requisição legítima |
| Datas inexistentes como 30/02 eram normalizadas pelo JavaScript no dashboard | Exigir formato civil e correspondência entre texto e calendário | Teste de data inexistente, período incompleto/invertido e bissexto |
| Redefinição verificava token antes da transação, permitindo consumo concorrente | Reservar token não usado/não expirado dentro da transação antes da alteração de senha | Unitário de disputa e duas chamadas simultâneas na API: 204/400 |
| Parcela era validada antes da atualização sem condição atômica | Atualizar somente parcela pendente/vencida e verificar quantidade alterada | Unitário de disputa e rejeição de pagamento duplicado na API |
| Pagamentos simultâneos das últimas parcelas podiam consultar saldo pendente desatualizado | Serializar pagamento/cancelamento por atualização condicional da conta dentro da transação | API paga as duas últimas parcelas em paralelo e confirma FINALIZADA |
| CORS era fixo em duas origens web | Introduzir lista explícita `CORS_ORIGINS`, mantendo padrões existentes | Testes de parser; exemplo de configuração sem origem coringa |
| Teste do dashboard usava pagamento; E2E usava campo inexistente `despesas`, intervalo sem vencimento e chamada a método privado | Alinhar testes a competência/vencimento, `totalDespesas` e operação pública de alertas | Testes unitários e API aprovados |
| E2E reutilizaria ambiente padrão | Exigir URL exclusiva de teste antes de importar a aplicação; usar cluster temporário | `ambiente-e2e.ts`, logs de inicialização e migrations |
| Inicialização E2E excedeu hook padrão de 5 segundos no ambiente local | Definir prazo de inicialização de 60 segundos e de 30 por cenário | Tentativa inicial preservada e execução final aprovada |
| Build mobile falhava por CSS acima de 12 kB | Remover seletores sem uso na página de relatórios | Build aprovado sem aumentar budget |
| Dashboard não explicitava inclusão de parcelas em aberto | Esclarecer subtítulos nas duas interfaces | Templates alterados e regras documentadas |

Não se alterou a regra de seleção por competência/vencimento para satisfazer o teste antigo. A diferença entre compromissos no dashboard e pagos no relatório foi mantida e justificada no documento 03. O parcelamento já distribuía corretamente centavos e limitava datas ao mês de destino; foram ampliados os testes, sem recriar a implementação.

## Arquivos de código/configuração modificados ou adicionados

- `backend/.env.example`, `backend/src/main.ts`, `backend/src/config/cors.config.ts` e `cors.config.spec.ts`.
- `backend/src/modules/auth/auth.service.ts` e novo `auth.service.spec.ts`.
- `backend/src/modules/dashboard/dashboard.service.ts` e `dashboard.service.spec.ts`.
- `backend/src/modules/parcelamentos/parcelamentos.service.ts`, `parcelas.service.ts`, `parcelas.service.spec.ts` e `parcelamento.utils.spec.ts`.
- `backend/src/modules/transacoes/recorrencia.utils.spec.ts` e novo `backend/src/modules/relatorios/relatorios.service.spec.ts`.
- `backend/test/api.e2e-spec.ts`, `backend/test/jest-e2e.json` e novo `backend/test/ambiente-e2e.ts`.
- Em `frontend` e `mobile`: `src/app/core/interceptors/auth.interceptor.ts`, novo `auth.interceptor.spec.ts`, `src/app/core/services/auth.service.spec.ts` e `src/app/pages/dashboard/components/dashboard-summary/dashboard-summary.html`.
- `mobile/src/app/pages/relatorios/relatorios.scss` e `mobile/.gitignore` (ignorar cobertura gerada).

Os três arquivos nativos regravados pelo sync apenas com diferença de final de linha foram restaurados ao conteúdo da base. Os assets gerados ficam nas pastas ignoradas das plataformas. Schema, migrations, dependências e lockfiles não foram modificados.

## Testes preexistentes e ampliação

Antes da revisão havia os testes unitários de documentos, DTO de usuário, recorrência, distribuição de parcelas, pagamento de parcelas e dashboard; o E2E da API; e testes de autenticação, receitas e perfis nas duas interfaces. A lista preservada encontra-se em `logs/testes-iniciais.txt`. Não se atribui uma contagem de casos executados à base original, pois não foi executada isoladamente antes das correções.

Foram adicionados arquivos de testes para relatórios, autenticação backend, CORS e interceptor de cada interface. Foram ampliados cenários de calendário, centavos, autorização, filtros, consumo de token, pagamento concorrente, sessão expirada e erro de renovação. O E2E também verifica reexecução de recorrência com uma nova instância de serviço. Isso demonstra independência do estado em memória do serviço, mas não constitui ensaio de reinício completo do sistema operacional.

Na execução final: **32 unitários backend + 13 de API + 10 frontend + 10 mobile = 65 aprovados, 0 reprovados e 0 ignorados**. Builds das três aplicações, lint backend e sync Capacitor retornaram zero. A execução inicial de API falhou por inicialização, e o primeiro build mobile/lint falhou pelos motivos registrados; as falhas não foram omitidas.

A cobertura de linhas foi **19,25% no backend**, **53,07% nos arquivos carregados pelos testes frontend** e **52,8% nos arquivos carregados pelos testes mobile**. Esses denominadores são distintos; os percentuais não devem ser comparados como cobertura completa equivalente. A tabela com todas as métricas e os logs está no [documento 05](05-resultados-testes.md).

## Revisão de segurança

Senhas são protegidas por Argon2; a versão instalada utiliza Argon2id por padrão, conforme `node_modules/argon2/argon2.cjs` (tipo padrão argon2id, timeCost 3 e memoryCost 65536). Tokens de refresh e redefinição são persistidos como SHA-256, com expiração e revogação/uso. Access e refresh usam segredos distintos e tempos configuráveis, por padrão 15 minutos e 7 dias. O payload de acesso é verificado pela estratégia JWT, que consulta o usuário ativo e seu papel atual no banco.

Os módulos financeiros aplicam JWT e verificam propriedade do perfil; administração utiliza RolesGuard. O ValidationPipe global rejeita propriedades extras e os DTOs validam formatos, tipos, UUIDs e limites. Há Throttler global e limites específicos no login/recuperação, além do bloqueio por falhas de credenciais. CORS deixou de exigir alteração de código para implantações com origens distintas, sem ampliar o padrão para qualquer origem.

Não foram encontrados logs explícitos de credenciais nos serviços inspecionados. A seleção pública de usuário exclui senhaHash. O filtro de exceções oculta mensagens internas de erros 500, mas isso não demonstra ausência de exposição em todos os caminhos e configurações de hospedagem. Tokens das interfaces permanecem em localStorage/sessionStorage; a revisão não migrou o armazenamento. Logout e troca de senha revogam refresh, mas não revogam imediatamente access tokens já emitidos. O modo de recuperação de desenvolvimento exige configuração correta de production/SMTP. Essas limitações e as disputas de contagem de login/alertas estão registradas no documento 08.

## Diagramas, capturas e documentos acadêmicos

Entregues: `diagrama-er.mmd` editável com os dez modelos reais e diagrama de fluxo Mermaid no documento 03. Não há exportação PNG nova do ER; os diagramas PlantUML e PNG antigos foram preservados.

Todas as 33 capturas (23 mobile e 10 web) foram inspecionadas e catalogadas no documento 06. Há manifesto de SHA-256 e dimensões. Os originais não foram alterados; algumas imagens precisam de anonimização antes de publicação. Não foram geradas imagens fictícias nem usadas imagens como comprovação de testes de cálculo.

Foram produzidos os nove documentos solicitados, mais o estado inicial, o ER, o manifesto visual e os logs de execução. `gerar-catalogo.cjs` e `registrar-resultados.cjs` permitem regenerar o catálogo e o resumo a partir de arquivos reais; não simulam resultados.

## Pendências e orientações para o TCC

Usar os documentos 01–03 para descrição técnica; o documento 04 como método de validação; o 05 como fonte dos números; o 06 para selecionar figuras; o 07 como texto-base de resultados; e o 08 para limitações/trabalhos futuros. Revisar a modelagem antiga que apresenta identificadores inteiros e não usar esse diagrama como representação física do PostgreSQL.

Não afirmar regime de caixa, validação de APK/iOS, teste de navegação completo, alta cobertura global, usabilidade, desempenho ou satisfação de usuários. Publicar capturas somente após ocultação dos dados identificáveis/financeiros ou nova captura real com dados sintéticos. A URL mobile de desenvolvimento e a configuração de produção ainda precisam ser adaptadas ao ambiente de implantação.

Os comandos de validação e reprodução estão no [documento 04](04-plano-de-testes.md). Os principais são `prisma generate`, `prisma migrate deploy` no banco isolado, `npm.cmd run test:cov`, `npm.cmd run test:e2e`, `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd test -- --watch=false --browsers=ChromeHeadless --code-coverage` e `npm.cmd run mobile:sync`. `git diff --check` verifica a formatação do patch final.

A revisão e o material solicitado foram produzidos com as pendências explicitadas. Permanecem fora da validação concluída: execução nativa, anonimização de cópias de capturas para publicação, renderização adicional do ER e os cenários ainda sem cobertura descritos no documento 08.
