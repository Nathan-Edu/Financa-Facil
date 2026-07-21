import { TipoPerfil } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class CriarPerfilDto {
  @IsString()
  @Length(3, 120)
  nome!: string;

  @IsEnum(TipoPerfil)
  tipo!: TipoPerfil;

  @IsString()
  documento!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  renda?: number;
}
