# Requisitos comprovados pelo código

Esta matriz utiliza os mesmos identificadores definidos em
`docs/requisitos/requisitos-funcionais.md` e
`docs/requisitos/requisitos-nao-funcionais.md`.

“Implementado” indica que foi localizada implementação correspondente no código-fonte.
Isso não equivale, por si só, à validação completa da funcionalidade pela interface.
Quando disponível, a coluna de evidência também indica testes automatizados ou outros
artefatos utilizados na verificação. Os resultados das execuções estão documentados no
arquivo `05-resultados-testes.md`.

## Requisitos Funcionais

| ID | Descrição | Módulo responsável | Situação | Evidência |
|---|---|---|---|---|
| RF01 | Cadastrar usuários | auth | Implementado; coberto em cenário de API | `AuthService.cadastrar`, `test/api.e2e-spec.ts` |
| RF02 | Autenticar usuários cadastrados | auth | Implementado; coberto em cenário de API | `AuthService.login`, `test/api.e2e-spec.ts` |
| RF03 | Cadastrar e gerenciar múltiplos perfis financeiros vinculados ao usuário | perfis | Implementado | `PerfisService.criar`, `listar`, `atualizar` e `remover` |
| RF04 | Cadastrar receitas | transacoes / interface web e mobile | Implementado; cobertura parcial | `TransacoesService.criar`, serviços de receitas das interfaces |
| RF05 | Cadastrar despesas | transacoes / interface web e mobile | Implementado; cobertura parcial | `TransacoesService.criar`, serviços de despesas das interfaces |
| RF06 | Gerenciar categorias financeiras | categorias | Implementado; cobertura parcial | `CategoriasService` |
| RF07 | Cadastrar e controlar contas parceladas | parcelamentos | Implementado e exercitado em testes selecionados | `ParcelamentosService.criar`, `listar` e `atualizar` |
| RF08 | Registrar pagamento de parcelas | parcelamentos | Implementado e testado | `ParcelasService.pagar`, testes unitários e de API |
| RF09 | Calcular o saldo financeiro por perfil | dashboard | Implementado; cenários financeiros verificados | `DashboardService.resumo` |
| RF10 | Consultar movimentações com filtros por categoria, período e tipo | transacoes | Implementado | `TransacoesService.listar`, `FiltroTransacoesDto` |
| RF11 | Gerar relatórios por período e perfil, com exportação em PDF | relatorios / interface | Implementado; geração dos dados testada e exportação presente na interface | `RelatoriosService.financeiro`, `exportarRelatorio`, jsPDF |
| RF12 | Emitir alertas para parcelas próximas do vencimento | alertas | Implementado; processamento considera os próximos sete dias | `AlertasService.processarAlertas`, `processarVencimentos` |
| RF13 | Permitir gerenciamento de usuários pelo administrador | usuarios / common | Implementado; controle por papel presente | `RolesGuard`, `UsuariosController` |
| RF14 | Validar CPF durante cadastro e edição do perfil financeiro | perfis / validators | Implementado; validação automatizada existente | `documento.validator.ts`, `documento.validator.spec.ts`, `PerfisService.validarDocumento` |
| RF15 | Bloquear temporariamente o usuário após tentativas consecutivas de autenticação inválidas | auth | Implementado; mecanismo de contagem e bloqueio presente | `AuthService`, controle de `tentativasLogin` e `bloqueadoAte` |
| RF16 | Alterar senha mediante confirmação da senha atual | auth | Implementado | `AuthService.alterarSenha`, telas de alteração de senha |
| RF17 | Atualizar informações do perfil financeiro, incluindo renda | perfis | Implementado | `PerfisService.atualizar`, `PATCH /perfis/:id/renda` |
| RF18 | Recuperar senha por meio do e-mail cadastrado | auth / mail | Implementado; envio SMTP real não validado | `MailService`, fluxo de recuperação e redefinição de senha |
| RF19 | Editar e excluir receitas e despesas cadastradas | transacoes | Implementado; exclusão tratada de forma lógica | `TransacoesService.atualizar`, operação de cancelamento/exclusão |
| RF20 | Cancelar contas parceladas | parcelamentos | Implementado; preserva parcelas já pagas | `ParcelamentosService.cancelar` |
| RF21 | Atualizar para vencida parcela pendente cuja data de vencimento tenha expirado | alertas / parcelamentos | Implementado no processamento periódico | `AlertasService.processarVencimentos` |

## Requisitos Não Funcionais

| ID | Descrição | Situação | Evidência |
|---|---|---|---|
| RNF01 | Disponibilizar interface web responsiva para computadores e dispositivos móveis | Implementado na interface; sem ensaio formal completo de responsividade | Projeto Angular, estilos responsivos e capturas da interface |
| RNF02 | Utilizar autenticação para restringir funcionalidades protegidas | Implementado e exercitado em cenários selecionados | JWT, guards de autenticação e testes da API |
| RNF03 | Utilizar PostgreSQL para persistência dos dados | Implementado e utilizado na integração | `schema.prisma`, migrations e PostgreSQL isolado nos testes |
| RNF04 | Utilizar Angular no frontend e Node.js/NestJS no backend | Atendido | Arquivos de dependências dos projetos frontend e backend |
| RNF05 | Responder às operações usuais em até dois segundos no ambiente de testes | Não comprovado pela verificação realizada | Não foi executado ensaio controlado de desempenho |
| RNF06 | Possuir estrutura modular com separação entre interface, serviços, regras e acesso a dados | Implementado | Módulos Angular/NestJS, serviços de negócio e `PrismaService` |
| RNF07 | Armazenar senhas por meio de algoritmo de hash | Implementado | `argon2.hash` e `argon2.verify` |
| RNF08 | Impedir acesso a rotas protegidas sem sessão autenticada válida | Implementado; exercitado em cenários selecionados | Guards JWT e respostas de autorização da API |
| RNF09 | Registrar data e hora em operações relevantes para rastreabilidade | Implementado | Campos `createdAt`, `updatedAt` e `LogAuditoria` no schema Prisma |
| RNF10 | Utilizar português brasileiro como idioma padrão da interface | Implementado na versão analisada | Textos, componentes e capturas das interfaces web e mobile |

## Funcionalidades adicionais identificadas

Durante a revisão também foram identificadas funcionalidades implementadas que não
correspondem diretamente a um requisito funcional numerado na especificação original,
entre elas:

- renovação e revogação de sessão por refresh token;
- geração e controle de transações recorrentes;
- isolamento de informações por usuário e perfil;
- controle de concorrência em operações financeiras;
- descarte e atualização de alertas;
- mecanismos adicionais de auditoria.

Essas funcionalidades são tratadas como recursos adicionais da implementação e não
recebem novos identificadores RF nesta matriz, evitando alterar a numeração dos requisitos
originais.

## Limites das evidências

As evidências analisadas não demonstram desempenho dentro do limite definido no RNF05,
disponibilidade em ambiente de produção, avaliação formal de usabilidade, conformidade
integral de segurança ou execução nativa completa em dispositivos físicos. Esses aspectos
não recebem aprovação presumida apenas pela existência da implementação.
