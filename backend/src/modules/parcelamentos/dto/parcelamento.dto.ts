import { StatusContaParcelada } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';

export class CriarParcelamentoDto {
  @IsUUID() perfilId!: string;
  @IsUUID() categoriaId!: string;
  @IsString() @Length(2, 160) descricao!: string;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) valorTotal!: number;
  @Type(() => Number) @IsInt() @Min(1) @Max(360) quantidadeParcelas!: number;
  @IsDateString() dataCompra!: string;
  @IsDateString() primeiroVencimento!: string;
  @IsOptional() @IsString() @Length(0, 500) observacao?: string;
}

export class AtualizarParcelamentoDto {
  @IsOptional() @IsUUID() categoriaId?: string;
  @IsOptional() @IsString() @Length(2, 160) descricao?: string;
  @IsOptional() @IsString() @Length(0, 500) observacao?: string;
}

export class FiltroParcelamentosDto {
  @IsUUID() perfilId!: string;
  @IsOptional() @IsEnum(StatusContaParcelada) status?: StatusContaParcelada;
  @IsOptional() @IsString() busca?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}
