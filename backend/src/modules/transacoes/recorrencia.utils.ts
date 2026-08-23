import { FrequenciaRecorrencia } from '@prisma/client';

export function adicionarPeriodo(data: Date, frequencia: FrequenciaRecorrencia): Date {
  if (frequencia === FrequenciaRecorrencia.SEMANAL) {
    const resultado = new Date(data);
    resultado.setUTCDate(resultado.getUTCDate() + 7);
    return resultado;
  }

  const meses = frequencia === FrequenciaRecorrencia.ANUAL ? 12 : 1;
  const ano = data.getUTCFullYear();
  const mes = data.getUTCMonth() + meses;
  const dia = data.getUTCDate();
  const ultimoDia = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
  return new Date(Date.UTC(ano, mes, Math.min(dia, ultimoDia)));
}

export function deslocarVencimento(dataCompetenciaOriginal: Date, dataVencimentoOriginal: Date | null, novaCompetencia: Date): Date | null {
  if (!dataVencimentoOriginal) return null;
  const diferencaDias = Math.round((dataVencimentoOriginal.getTime() - dataCompetenciaOriginal.getTime()) / 86_400_000);
  const vencimento = new Date(novaCompetencia);
  vencimento.setUTCDate(vencimento.getUTCDate() + diferencaDias);
  return vencimento;
}
