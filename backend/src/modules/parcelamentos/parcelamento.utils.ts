export function distribuirParcelas(valorTotal: number, quantidade: number): number[] {
  if (!Number.isFinite(valorTotal) || valorTotal <= 0 || !Number.isInteger(quantidade) || quantidade < 1) {
    throw new Error('Valor total e quantidade de parcelas devem ser positivos');
  }
  const totalCentavos = Math.round(valorTotal * 100);
  const base = Math.floor(totalCentavos / quantidade);
  const resto = totalCentavos % quantidade;
  return Array.from({ length: quantidade }, (_, indice) => (base + (indice < resto ? 1 : 0)) / 100);
}

export function adicionarMeses(dataIso: string, meses: number): Date {
  const [ano, mes, dia] = dataIso.slice(0, 10).split('-').map(Number);
  const primeiroDoDestino = new Date(Date.UTC(ano, mes - 1 + meses, 1));
  const ultimoDia = new Date(Date.UTC(
    primeiroDoDestino.getUTCFullYear(),
    primeiroDoDestino.getUTCMonth() + 1,
    0,
  )).getUTCDate();
  return new Date(Date.UTC(
    primeiroDoDestino.getUTCFullYear(),
    primeiroDoDestino.getUTCMonth(),
    Math.min(dia, ultimoDia),
  ));
}
