-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('USUARIO', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "TipoPerfil" AS ENUM ('PESSOAL', 'EMPRESARIAL');

-- CreateEnum
CREATE TYPE "TipoCategoria" AS ENUM ('RECEITA', 'DESPESA', 'AMBOS');

-- CreateEnum
CREATE TYPE "TipoTransacao" AS ENUM ('RECEITA', 'DESPESA');

-- CreateEnum
CREATE TYPE "StatusTransacao" AS ENUM ('PENDENTE', 'PAGA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "StatusContaParcelada" AS ENUM ('ATIVA', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "StatusParcela" AS ENUM ('PENDENTE', 'PAGA', 'VENCIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "tipo" "TipoUsuario" NOT NULL DEFAULT 'USUARIO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "tentativas_login" INTEGER NOT NULL DEFAULT 0,
    "bloqueado_ate" TIMESTAMPTZ(3),
    "ultimo_login_em" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expira_em" TIMESTAMPTZ(3) NOT NULL,
    "revogado_em" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_redefinicao_senha" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expira_em" TIMESTAMPTZ(3) NOT NULL,
    "utilizado_em" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_redefinicao_senha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfis_financeiros" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "tipo" "TipoPerfil" NOT NULL,
    "documento" VARCHAR(14) NOT NULL,
    "renda" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "selecionado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "perfis_financeiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" UUID NOT NULL,
    "perfil_id" UUID NOT NULL,
    "nome" VARCHAR(80) NOT NULL,
    "tipo" "TipoCategoria" NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacoes" (
    "id" UUID NOT NULL,
    "perfil_id" UUID NOT NULL,
    "categoria_id" UUID NOT NULL,
    "tipo" "TipoTransacao" NOT NULL,
    "descricao" VARCHAR(160) NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "data_competencia" DATE NOT NULL,
    "data_vencimento" DATE,
    "data_pagamento" TIMESTAMPTZ(3),
    "status" "StatusTransacao" NOT NULL DEFAULT 'PENDENTE',
    "observacao" VARCHAR(500),
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "forma_pagamento" VARCHAR(50),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contas_parceladas" (
    "id" UUID NOT NULL,
    "perfil_id" UUID NOT NULL,
    "categoria_id" UUID NOT NULL,
    "descricao" VARCHAR(160) NOT NULL,
    "valor_total" DECIMAL(14,2) NOT NULL,
    "quantidade_parcelas" INTEGER NOT NULL,
    "data_compra" DATE NOT NULL,
    "status" "StatusContaParcelada" NOT NULL DEFAULT 'ATIVA',
    "observacao" VARCHAR(500),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "contas_parceladas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcelas" (
    "id" UUID NOT NULL,
    "conta_parcelada_id" UUID NOT NULL,
    "numero" INTEGER NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "data_vencimento" DATE NOT NULL,
    "data_pagamento" TIMESTAMPTZ(3),
    "status" "StatusParcela" NOT NULL DEFAULT 'PENDENTE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "parcelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas" (
    "id" UUID NOT NULL,
    "perfil_id" UUID NOT NULL,
    "parcela_id" UUID,
    "mensagem" VARCHAR(255) NOT NULL,
    "lido" BOOLEAN NOT NULL DEFAULT false,
    "data_alerta" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "perfil_id" UUID,
    "acao" VARCHAR(80) NOT NULL,
    "entidade" VARCHAR(80) NOT NULL,
    "entidade_id" VARCHAR(80),
    "dados_anteriores" JSONB,
    "dados_novos" JSONB,
    "ip" VARCHAR(45),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuario_id_idx" ON "refresh_tokens"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_redefinicao_senha_token_hash_key" ON "tokens_redefinicao_senha"("token_hash");

-- CreateIndex
CREATE INDEX "tokens_redefinicao_senha_usuario_id_idx" ON "tokens_redefinicao_senha"("usuario_id");

-- CreateIndex
CREATE INDEX "perfis_financeiros_usuario_id_ativo_idx" ON "perfis_financeiros"("usuario_id", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "perfis_financeiros_usuario_id_documento_key" ON "perfis_financeiros"("usuario_id", "documento");

-- CreateIndex
CREATE INDEX "categorias_perfil_id_ativa_idx" ON "categorias"("perfil_id", "ativa");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_perfil_id_nome_tipo_key" ON "categorias"("perfil_id", "nome", "tipo");

-- CreateIndex
CREATE INDEX "transacoes_perfil_id_data_competencia_idx" ON "transacoes"("perfil_id", "data_competencia");

-- CreateIndex
CREATE INDEX "transacoes_perfil_id_tipo_status_idx" ON "transacoes"("perfil_id", "tipo", "status");

-- CreateIndex
CREATE INDEX "transacoes_categoria_id_idx" ON "transacoes"("categoria_id");

-- CreateIndex
CREATE INDEX "contas_parceladas_perfil_id_status_idx" ON "contas_parceladas"("perfil_id", "status");

-- CreateIndex
CREATE INDEX "parcelas_status_data_vencimento_idx" ON "parcelas"("status", "data_vencimento");

-- CreateIndex
CREATE UNIQUE INDEX "parcelas_conta_parcelada_id_numero_key" ON "parcelas"("conta_parcelada_id", "numero");

-- CreateIndex
CREATE INDEX "alertas_perfil_id_lido_idx" ON "alertas"("perfil_id", "lido");

-- CreateIndex
CREATE UNIQUE INDEX "alertas_parcela_id_data_alerta_key" ON "alertas"("parcela_id", "data_alerta");

-- CreateIndex
CREATE INDEX "logs_auditoria_usuario_id_created_at_idx" ON "logs_auditoria"("usuario_id", "created_at");

-- CreateIndex
CREATE INDEX "logs_auditoria_perfil_id_created_at_idx" ON "logs_auditoria"("perfil_id", "created_at");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_redefinicao_senha" ADD CONSTRAINT "tokens_redefinicao_senha_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfis_financeiros" ADD CONSTRAINT "perfis_financeiros_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "perfis_financeiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "perfis_financeiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_parceladas" ADD CONSTRAINT "contas_parceladas_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "perfis_financeiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_parceladas" ADD CONSTRAINT "contas_parceladas_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcelas" ADD CONSTRAINT "parcelas_conta_parcelada_id_fkey" FOREIGN KEY ("conta_parcelada_id") REFERENCES "contas_parceladas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "perfis_financeiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_parcela_id_fkey" FOREIGN KEY ("parcela_id") REFERENCES "parcelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "perfis_financeiros"("id") ON DELETE SET NULL ON UPDATE CASCADE;
