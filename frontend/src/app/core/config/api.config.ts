const hostLocal = ['localhost', '127.0.0.1'].includes(globalThis.location?.hostname ?? '');
const origem = hostLocal
  ? 'http://localhost:3000'
  : globalThis.location?.origin ?? 'http://localhost:3000';

export const API_URL = `${origem}/api/v1`;
