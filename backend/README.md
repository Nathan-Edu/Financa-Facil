# Backend — Finança Fácil

API REST em NestJS com Prisma e PostgreSQL.

## Pré-requisitos

- Node.js 22 LTS ou superior
- PostgreSQL 16 ou superior

## Execução local

```powershell
Copy-Item .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

A API será disponibilizada em `http://localhost:3000/api/v1`.
A documentação Swagger fica em `http://localhost:3000/docs`.

## Implementado nesta base

- Modelagem completa inicial no Prisma.
- Cadastro, login, refresh token, logout e identificação do usuário autenticado.
- Hash de senha com Argon2.
- Bloqueio temporário após tentativas incorretas.
- CRUD de perfis financeiros.
- Validação algorítmica de CPF e CNPJ.
- Isolamento dos perfis pelo usuário autenticado.
- CRUD de categorias com desativação lógica.
- Cadastro, consulta paginada, edição, pagamento e cancelamento de transações.
- Filtros de transações por tipo, status, categoria, período e descrição.
- Recuperação e alteração de senha, com SMTP opcional.
- Administração de usuários e autorização por papel.
- Contas parceladas, geração e pagamento de parcelas.
- Dashboard e relatórios em regime de caixa.
- Alertas de vencimento e atualização automática diária.
- Auditoria das operações críticas.
- Respostas de erro padronizadas, rate limiting e health check.
- Migrations versionadas do PostgreSQL.
- Testes unitários e E2E com PostgreSQL.

## Comandos de qualidade

```powershell
npm run build
npm run lint
npm test
npm run test:e2e
npm run test:cov
```

## Administrador inicial

Defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env` e execute:

```powershell
npm run prisma:seed
```

Para envio real de recuperação de senha, configure as variáveis `SMTP_*` descritas em `.env.example`.
