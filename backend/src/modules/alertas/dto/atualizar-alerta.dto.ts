import { IsBoolean, IsOptional } from 'class-validator';

export class AtualizarAlertaDto {
  @IsOptional() @IsBoolean() lido?: boolean;
  @IsOptional() @IsBoolean() descartado?: boolean;
}
