-- DropIndex
DROP INDEX "alertas_parcela_id_data_alerta_key";

-- AlterTable
ALTER TABLE "categorias" ADD COLUMN     "cor" VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
ADD COLUMN     "icone" VARCHAR(50) NOT NULL DEFAULT 'category',
ADD COLUMN     "orcamento_mensal" DECIMAL(14,2);

-- AlterTable
ALTER TABLE "perfis_financeiros" ADD COLUMN     "cor" VARCHAR(7) NOT NULL DEFAULT '#2563eb',
ADD COLUMN     "descricao" VARCHAR(255),
ADD COLUMN     "icone" VARCHAR(30);
