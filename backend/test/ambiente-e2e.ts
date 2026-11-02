// Executado antes de importar AppModule. Nunca reutiliza DATABASE_URL do desenvolvimento.
const endereco = process.env.E2E_DATABASE_URL;
if (!endereco) throw new Error('Defina E2E_DATABASE_URL apontando para um banco PostgreSQL exclusivo de testes');
const url = new URL(endereco);
if (!['127.0.0.1', 'localhost'].includes(url.hostname) || !/^financa_tcc_test(?:_[a-z0-9]+)?$/.test(url.pathname.slice(1))) {
  throw new Error('E2E exige banco local com nome financa_tcc_test ou financa_tcc_test_<sufixo>');
}
process.env.DATABASE_URL = endereco;
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'segredo-access-exclusivo-testes-32-caracteres';
process.env.JWT_REFRESH_SECRET = 'segredo-refresh-exclusivo-testes-32-caracteres';
process.env.SMTP_HOST = '';
