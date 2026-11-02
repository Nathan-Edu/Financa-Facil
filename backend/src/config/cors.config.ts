// Lista explícita: preserva desenvolvimento web e permite configurar a origem nativa.
export function origensCors(valor?: string): string[] {
  return (valor ?? 'http://localhost:4200,http://localhost:4201')
    .split(',').map((origem) => origem.trim()).filter(Boolean);
}
