# Contrato inicial da API

Base URL local: `http://localhost:3000/api/v1`

## Convenções

- JSON como formato de entrada e saída.
- Datas civis no formato `YYYY-MM-DD` e instantes em ISO 8601.
- Valores monetários são enviados como números com duas casas decimais, sem formatação.
- Rotas protegidas recebem `Authorization: Bearer <token>`.
- Dados financeiros sempre pertencem a um perfil financeiro.
- Listagens paginadas recebem `page` e `limit` e retornam `data` e `meta`.

## Resposta de erro

```json
{
  "statusCode": 400,
  "message": ["O e-mail informado é inválido"],
  "error": "Bad Request",
  "path": "/api/v1/auth/cadastro",
  "timestamp": "2026-07-12T12:00:00.000Z"
}
```

## Autenticação

### `POST /auth/cadastro`

```json
{
  "nome": "Maria Silva",
  "email": "maria@example.com",
  "senha": "Senha@123"
}
```

### `POST /auth/login`

```json
{
  "email": "maria@example.com",
  "senha": "Senha@123"
}
```

Resposta do cadastro e login:

```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "usuario": {
    "id": "uuid",
    "nome": "Maria Silva",
    "email": "maria@example.com",
    "tipo": "USUARIO"
  }
}
```

Também estão disponíveis as rotas:

- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/esqueci-senha`
- `POST /auth/redefinir-senha`
- `PATCH /auth/alterar-senha`
- `GET /auth/me`

## Perfis financeiros

- `POST /perfis`
- `GET /perfis`
- `GET /perfis/:id`
- `PATCH /perfis/:id`
- `DELETE /perfis/:id`
- `PATCH /perfis/:id/ativar`
- `PATCH /perfis/:id/renda`

Exemplo de criação:

```json
{
  "nome": "Finanças pessoais",
  "tipo": "PESSOAL",
  "documento": "52998224725",
  "renda": 4500.00
}
```

Para empresa, `tipo` deve ser `EMPRESARIAL` e o documento deve ser um CNPJ.

## Módulos financeiros

| Módulo | Rotas principais |
|---|---|
| Categorias | CRUD em `/categorias` (implementado) |
| Transações | CRUD em `/transacoes` e `PATCH /transacoes/:id/pagar` (implementado) |
| Contas parceladas | CRUD em `/contas-parceladas` e cancelamento (implementado) |
| Parcelas | consulta pela conta e `PATCH /parcelas/:id/pagar` (implementado) |
| Dashboard | `GET /dashboard/resumo` (implementado) |
| Relatórios | `GET /relatorios/financeiro` (implementado) |
| Alertas | consulta e marcação de leitura em `/alertas` (implementado) |

## Usuários e administração

- `GET /usuarios/me`
- `PATCH /usuarios/me`
- `GET /usuarios` — administrador
- `PATCH /usuarios/:id/status` — administrador
- `PATCH /usuarios/:id/tipo` — administrador

## Operação

- `GET /health`
- Swagger em `/docs`
- Rotina diária para parcelas vencidas e alertas de sete dias.

## Decisões adotadas

- Saldo e relatórios usam regime de caixa.
- CPF/CNPJ é único por usuário, permitindo perfis de responsáveis distintos sobre o mesmo documento.
- Cancelar parcelamento preserva parcelas pagas e cancela somente as abertas.
- Alertas de parcelas são internos; recuperação de senha pode ser enviada por SMTP.
- Access token expira em 15 minutos, refresh token em 7 dias e bloqueio padrão dura 30 minutos.
