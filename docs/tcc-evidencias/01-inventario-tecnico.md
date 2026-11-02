# Inventário técnico

Revisão de 01/11/2026 sobre `d479a3b`, branch `revisao/validacao-tecnica-tcc`. O estado inicial consta em [00-estado-inicial.md](00-estado-inicial.md). A árvore rastreada completa está em [logs/inventario-arquivos.txt](logs/inventario-arquivos.txt). Pastas locais antigas na raiz não integram o monorepositório revisado.

| Tecnologia | Versão resolvida no lockfile | Uso observado |
|---|---|---|
| Node.js | v24.18.0, executada localmente | Ambiente de execução e ferramentas |
| NestJS core | 11.1.28 | API modular em `backend/src` |
| Prisma / Client | 6.19.3 | Acesso ao PostgreSQL e migrations |
| PostgreSQL | 18.4, servidor temporário executado | Banco exclusivo da integração |
| Argon2 | 0.43.1 | Hash e verificação de senhas |
| Angular web | 20.3.29 | `frontend/src` |
| Angular mobile | 20.3.34 | `mobile/src` |
| Ionic | 8.8.19 | Componentes e estrutura mobile |
| Capacitor | 7.6.9 | Empacotamento e projetos nativos |
| TypeScript backend | 5.9.3 | Compilação da API |
| TypeScript interfaces | 5.8.3 | Compilação Angular |
| Jest | 29.7.0 | Testes unitários e API E2E |
| Karma | 6.4.4 | Testes das interfaces, com Jasmine |

As versões acima são resolvidas, não apenas as faixas declaradas em `package.json`. O registro verificável é [logs/versoes-lock.json](logs/versoes-lock.json). A versão PostgreSQL consta no log de inicialização do servidor temporário. Não houve atualização de dependências ou lockfiles.

| Diretório ou módulo | Responsabilidade |
|---|---|
| `backend/src/modules/auth` | Cadastro, login, JWT, refresh, logout e senhas |
| `usuarios` | Conta do usuário e administração por papel |
| `perfis` | Perfis pessoais/empresariais, documento e seleção |
| `categorias` | Categorias e orçamento mensal |
| `transacoes` | Receitas/despesas, pagamento, cancelamento e recorrência |
| `parcelamentos` | Conta parcelada, distribuição de valores, vencimentos e pagamentos |
| `dashboard` | Resumo por período e compromissos parcelados |
| `relatorios` | Resumo, categorias, evolução mensal e movimentações |
| `alertas` | Alertas de vencimento/orçamento e rotinas agendadas |
| `health` | Disponibilidade da API e conexão com banco |
| `backend/src/common` | Guards, autorização de perfil, validação de documentos, filtro de erros e interceptor Decimal |
| `backend/src/config`, `prisma` | Ambiente, CORS, PrismaService; schema, seed e seis migrations |
| `frontend/src/app/core`, `mobile/src/app/core` | Serviços HTTP, sessão, interceptors, guards, modelos e mocks |
| `pages`, `shared` nas interfaces | Telas de autenticação, conta, financeiro, administração e componentes reutilizáveis |
| `mobile/android`, `mobile/ios` | Projetos nativos existentes, integrados pelo Capacitor |
| `docs/api` | Contrato da API já existente |
| `docs/requisitos` | Requisitos funcionais/não funcionais e regras de negócio existentes |
| `docs/modelagem` | Atividades, casos de uso, classes e sequências em PlantUML e PNG |
| `docs/capturas` | 23 imagens mobile e 10 web, catalogadas no documento 06 |

Os módulos NestJS contêm controllers, serviços e DTOs. Não há camada de repositórios separada: os serviços usam `PrismaService` diretamente. A existência de arquivos `core/mock` não significa que a aplicação inteira opere com mocks; os serviços financeiros inspecionados usam HttpClient.

Scripts existentes: backend `build`, `lint`, `test`, `test:cov`, `test:e2e`, `start`, `start:dev` e comandos Prisma. Interfaces: `start`, `build`, `watch`, `test`; mobile também possui comandos `mobile:sync`, Android/iOS e abertura das IDEs. `start.py` e `iniciar-financa-facil.bat` coordenam o ambiente local, mas não são validadores automatizados. O inicializador não foi executado para evitar sua preparação automática sobre um banco existente.

Antes da revisão havia seis arquivos unitários no backend, um E2E de API e três arquivos de serviços em cada interface. A lista original está em [logs/testes-iniciais.txt](logs/testes-iniciais.txt). A revisão acrescentou testes de relatórios, autenticação, CORS e interceptors, além de ampliar dashboard, parcelas, cálculos e API. Não foi encontrada infraestrutura de E2E de navegação web ou mobile.

O material de modelagem existente é acadêmico e não representa integralmente a persistência: por exemplo, o diagrama de classes utiliza identificadores inteiros, enquanto o schema utiliza UUID. Nenhum original foi substituído. O novo ER representa o schema real. Não foi encontrado arquivo de protótipo Figma no inventário rastreado; a menção a Figma no README não comprova um protótipo disponível.
