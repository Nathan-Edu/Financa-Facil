import { TipoPerfil } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsHexColor, IsNumber, IsOptional, IsString, Length, Matches, Min } from 'class-validator';

export class CriarPerfilDto {
  @IsString()
  @Length(3, 120)
  nome!: string;

  @IsEnum(TipoPerfil)
  tipo!: TipoPerfil;

  @IsString()
  documento!: string;

  @IsOptional() @IsString() @Length(0, 255) descricao?: string;
  @IsOptional() @IsHexColor() cor?: string;
  @IsOptional() @IsString() @Matches(/^[A-Za-z0-9_ -]{1,30}$/) icone?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  renda?: number;
}
