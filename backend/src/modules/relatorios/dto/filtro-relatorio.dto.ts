import { IsDateString, IsUUID } from 'class-validator';

export class FiltroRelatorioDto {
  @IsUUID() perfilId!: string;
  @IsDateString() dataInicial!: string;
  @IsDateString() dataFinal!: string;
}
