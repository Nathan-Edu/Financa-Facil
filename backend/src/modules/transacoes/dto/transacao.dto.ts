import { FrequenciaRecorrencia, StatusTransacao, TipoTransacao } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';

export class CriarTransacaoDto {
  @IsUUID()
  perfilId!: string;

  @IsUUID()
  categoriaId!: string;

  @IsEnum(TipoTransacao)
  tipo!: TipoTransacao;

  @IsString()
  @Length(2, 160)
  descricao!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor!: number;

  @IsDateString()
  dataCompetencia!: string;

  @IsOptional()
  @IsDateString()
  dataVencimento?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  observacao?: string;

  @IsOptional()
  @IsBoolean()
  recorrente?: boolean;

  @IsOptional()
  @IsEnum(FrequenciaRecorrencia)
  frequenciaRecorrencia?: FrequenciaRecorrencia;

  @IsOptional()
  @IsDateString()
  recorrenteAte?: string | null;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  formaPagamento?: string;
}

export class AtualizarTransacaoDto {
  @IsOptional() @IsUUID() categoriaId?: string;
  @IsOptional() @IsString() @Length(2, 160) descricao?: string;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) valor?: number;
  @IsOptional() @IsDateString() dataCompetencia?: string;
  @IsOptional() @IsDateString() dataVencimento?: string;
  @IsOptional() @IsString() @Length(0, 500) observacao?: string;
  @IsOptional() @IsBoolean() recorrente?: boolean;
  @IsOptional() @IsEnum(FrequenciaRecorrencia) frequenciaRecorrencia?: FrequenciaRecorrencia;
  @IsOptional() @IsDateString() recorrenteAte?: string | null;
  @IsOptional() @IsString() @Length(2, 50) formaPagamento?: string;
}

export class FiltroTransacoesDto {
  @IsUUID()
  perfilId!: string;

  @IsOptional() @IsEnum(TipoTransacao) tipo?: TipoTransacao;
  @IsOptional() @IsEnum(StatusTransacao) status?: StatusTransacao;
  @IsOptional() @IsUUID() categoriaId?: string;
  @IsOptional() @IsDateString() dataInicial?: string;
  @IsOptional() @IsDateString() dataFinal?: string;
  @IsOptional() @IsString() busca?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}
