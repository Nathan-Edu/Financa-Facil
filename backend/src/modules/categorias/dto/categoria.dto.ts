import { TipoCategoria } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CriarCategoriaDto {
  @IsUUID()
  perfilId!: string;

  @IsString()
  @Length(2, 80)
  nome!: string;

  @IsEnum(TipoCategoria)
  tipo!: TipoCategoria;
}

export class AtualizarCategoriaDto {
  @IsOptional()
  @IsString()
  @Length(2, 80)
  nome?: string;

  @IsOptional()
  @IsEnum(TipoCategoria)
  tipo?: TipoCategoria;

  @IsOptional()
  @IsBoolean()
  ativa?: boolean;
}
