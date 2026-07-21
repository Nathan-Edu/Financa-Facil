export interface EnvConfig {
  [key: string]: unknown;
}

export function validarAmbiente(config: Record<string, unknown>): EnvConfig {
  const obrigatorias = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  for (const chave of obrigatorias) {
    if (typeof config[chave] !== 'string' || String(config[chave]).length === 0) {
      throw new Error(`Variável de ambiente obrigatória ausente: ${chave}`);
    }
  }
  if (String(config.JWT_ACCESS_SECRET).length < 32 || String(config.JWT_REFRESH_SECRET).length < 32) {
    throw new Error('Os segredos JWT devem possuir pelo menos 32 caracteres');
  }
  return config;
}
