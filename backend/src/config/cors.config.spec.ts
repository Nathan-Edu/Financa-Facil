import { origensCors } from './cors.config';

describe('origensCors', () => {
  it('preserva as duas origens web padrão', () => {
    expect(origensCors()).toEqual(['http://localhost:4200', 'http://localhost:4201']);
  });
  it('aceita uma lista explícita para web e Capacitor sem liberar qualquer origem', () => {
    expect(origensCors(' https://app.example.com, capacitor://localhost, ,https://localhost '))
      .toEqual(['https://app.example.com', 'capacitor://localhost', 'https://localhost']);
  });
});
