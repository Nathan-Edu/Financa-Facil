import { adicionarMeses, distribuirParcelas } from './parcelamento.utils';

describe('ParcelamentoUtils', () => {
  it('distribui centavos sem alterar o total', () => {
    const parcelas = distribuirParcelas(100, 3);
    expect(parcelas).toEqual([33.34, 33.33, 33.33]);
    expect(Math.round(parcelas.reduce((total, valor) => total + valor, 0) * 100)).toBe(10_000);
  });

  it('gera parcelas iguais quando não há resto', () => {
    expect(distribuirParcelas(1200, 12)).toEqual(Array(12).fill(100));
  });

  it('preserva o último dia possível do mês', () => {
    expect(adicionarMeses('2026-01-31', 1).toISOString().slice(0, 10)).toBe('2026-02-28');
    expect(adicionarMeses('2024-01-31', 1).toISOString().slice(0, 10)).toBe('2024-02-29');
    expect(adicionarMeses('2026-01-31', 2).toISOString().slice(0, 10)).toBe('2026-03-31');
  });

  it('rejeita entradas inválidas', () => {
    expect(() => distribuirParcelas(0, 2)).toThrow();
    expect(() => distribuirParcelas(100, 0)).toThrow();
    expect(() => distribuirParcelas(Number.NaN, 3)).toThrow();
    expect(() => distribuirParcelas(100, 2.5)).toThrow();
    expect(() => distribuirParcelas(-1, 2)).toThrow();
  });

  it('preserva centavos em 360 parcelas e na virada do ano', () => {
    const valores = distribuirParcelas(1234.57, 360);
    expect(valores).toHaveLength(360);
    expect(valores.reduce((soma, valor) => soma + Math.round(valor * 100), 0)).toBe(123457);
    expect(adicionarMeses('2026-12-31', 1).toISOString().slice(0, 10)).toBe('2027-01-31');
  });
});
