import { TipoCategoria } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsHexColor, IsNumber, IsOptional, IsString, IsUUID, Length, Matches, Min } from 'class-validator';

export class CriarCategoriaDto {
  @IsUUID()
  perfilId!: string;

  @IsString()
  @Length(2, 80)
  nome!: string;

  @IsEnum(TipoCategoria)
  tipo!: TipoCategoria;

  @IsOptional() @IsString() @Matches(/^[A-Za-z0-9_ -]{1,50}$/) icone?: string;
  @IsOptional() @IsHexColor() cor?: string;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) orcamentoMensal?: number;
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

  @IsOptional() @IsString() @Matches(/^[A-Za-z0-9_ -]{1,50}$/) icone?: string;
  @IsOptional() @IsHexColor() cor?: string;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) orcamentoMensal?: number;
}
