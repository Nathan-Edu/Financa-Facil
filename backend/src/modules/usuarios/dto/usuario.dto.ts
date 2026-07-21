import { TipoUsuario } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsEnum, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class AtualizarUsuarioDto {
  @IsOptional() @IsString() @Length(3, 120) nome?: string;
  @IsOptional() @IsEmail() email?: string;
}

export class FiltroUsuariosDto {
  @IsOptional() @IsString() busca?: string;
  @IsOptional() @IsBoolean() @Type(() => Boolean) ativo?: boolean;
  @IsOptional() @IsEnum(TipoUsuario) tipo?: TipoUsuario;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}

export class AlterarStatusUsuarioDto {
  @IsBoolean()
  ativo!: boolean;
}

export class AlterarTipoUsuarioDto {
  @IsEnum(TipoUsuario)
  tipo!: TipoUsuario;
}
