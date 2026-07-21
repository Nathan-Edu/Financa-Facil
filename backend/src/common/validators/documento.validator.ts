function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

function todosIguais(valor: string): boolean {
  return /^(\d)\1+$/.test(valor);
}

export function cpfValido(valor: string): boolean {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || todosIguais(cpf)) return false;

  for (let tamanho = 9; tamanho <= 10; tamanho += 1) {
    const soma = cpf
      .slice(0, tamanho)
      .split('')
      .reduce((total, digito, indice) => total + Number(digito) * (tamanho + 1 - indice), 0);
    const resto = (soma * 10) % 11;
    const verificador = resto === 10 ? 0 : resto;
    if (verificador !== Number(cpf[tamanho])) return false;
  }
  return true;
}

export function cnpjValido(valor: string): boolean {
  const cnpj = somenteDigitos(valor);
  if (cnpj.length !== 14 || todosIguais(cnpj)) return false;

  const calcular = (base: string, pesos: number[]): number => {
    const soma = base.split('').reduce((total, digito, indice) => total + Number(digito) * pesos[indice], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const primeiro = calcular(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const segundo = calcular(`${cnpj.slice(0, 12)}${primeiro}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return cnpj.endsWith(`${primeiro}${segundo}`);
}

export function normalizarDocumento(valor: string): string {
  return somenteDigitos(valor);
}
