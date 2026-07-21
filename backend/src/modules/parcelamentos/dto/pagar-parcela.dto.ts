import { IsDateString, IsOptional } from 'class-validator';

export class PagarParcelaDto {
  @IsOptional()
  @IsDateString()
  dataPagamento?: string;
}
