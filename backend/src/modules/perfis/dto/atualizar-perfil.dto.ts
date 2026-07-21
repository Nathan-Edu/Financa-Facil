import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class AtualizarPerfilDto {
  @IsOptional()
  @IsString()
  @Length(3, 120)
  nome?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  renda?: number;
}

export class AtualizarRendaDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  renda!: number;
}
