/*
  Warnings:

  - A unique constraint covering the columns `[chave]` on the table `alertas` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TipoAlerta" AS ENUM ('VENCIMENTO', 'ORCAMENTO', 'INFORMATIVO');

-- CreateEnum
CREATE TYPE "PrioridadeAlerta" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

-- AlterTable
ALTER TABLE "alertas" ADD COLUMN     "categoria_id" UUID,
ADD COLUMN     "chave" VARCHAR(180),
ADD COLUMN     "prioridade" "PrioridadeAlerta" NOT NULL DEFAULT 'MEDIA',
ADD COLUMN     "tipo" "TipoAlerta" NOT NULL DEFAULT 'VENCIMENTO',
ADD COLUMN     "titulo" VARCHAR(120) NOT NULL DEFAULT 'Alerta';

-- CreateIndex
CREATE UNIQUE INDEX "alertas_chave_key" ON "alertas"("chave");

-- CreateIndex
CREATE INDEX "alertas_categoria_id_idx" ON "alertas"("categoria_id");

-- CreateIndex
CREATE INDEX "alertas_tipo_idx" ON "alertas"("tipo");

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
