import { cnpjValido, cpfValido, normalizarDocumento } from './documento.validator';

describe('DocumentoValidator', () => {
  it('valida e normaliza CPF', () => {
    expect(cpfValido('529.982.247-25')).toBe(true);
    expect(normalizarDocumento('529.982.247-25')).toBe('52998224725');
  });

  it('rejeita CPF inválido ou repetido', () => {
    expect(cpfValido('111.111.111-11')).toBe(false);
    expect(cpfValido('52998224724')).toBe(false);
  });

  it('valida e rejeita CNPJ corretamente', () => {
    expect(cnpjValido('04.252.011/0001-10')).toBe(true);
    expect(cnpjValido('00.000.000/0000-00')).toBe(false);
    expect(cnpjValido('04.252.011/0001-11')).toBe(false);
  });
});
