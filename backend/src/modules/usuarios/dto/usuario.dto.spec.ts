import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { FiltroUsuariosDto } from './usuario.dto';

describe('FiltroUsuariosDto', () => {
  it('converte explicitamente ativo=false sem tornar a string verdadeira', () => {
    const dto = plainToInstance(FiltroUsuariosDto, { ativo: 'false' });
    expect(dto.ativo).toBe(false);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('rejeita valores booleanos ambíguos', () => {
    const dto = plainToInstance(FiltroUsuariosDto, { ativo: 'qualquer' });
    expect(validateSync(dto)).not.toHaveLength(0);
  });
});
