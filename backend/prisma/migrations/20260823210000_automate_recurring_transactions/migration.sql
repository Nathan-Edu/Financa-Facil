CREATE TYPE "FrequenciaRecorrencia" AS ENUM ('SEMANAL', 'MENSAL', 'ANUAL');

ALTER TABLE "transacoes"
ADD COLUMN "frequencia_recorrencia" "FrequenciaRecorrencia",
ADD COLUMN "proxima_recorrencia" DATE,
ADD COLUMN "recorrente_ate" DATE,
ADD COLUMN "transacao_origem_id" UUID;

CREATE INDEX "transacoes_recorrente_proxima_recorrencia_idx"
ON "transacoes"("recorrente", "proxima_recorrencia");

CREATE UNIQUE INDEX "transacoes_transacao_origem_id_data_competencia_key"
ON "transacoes"("transacao_origem_id", "data_competencia");

ALTER TABLE "transacoes"
ADD CONSTRAINT "transacoes_transacao_origem_id_fkey"
FOREIGN KEY ("transacao_origem_id") REFERENCES "transacoes"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
