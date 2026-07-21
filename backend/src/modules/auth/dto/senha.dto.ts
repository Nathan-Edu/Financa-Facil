import { IsEmail, IsString, Length, Matches } from 'class-validator';

const senhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export class EsqueciSenhaDto {
  @IsEmail()
  email!: string;
}

export class RedefinirSenhaDto {
  @IsString()
  token!: string;

  @IsString()
  @Length(8, 72)
  @Matches(senhaForte)
  novaSenha!: string;
}

export class AlterarSenhaDto {
  @IsString()
  senhaAtual!: string;

  @IsString()
  @Length(8, 72)
  @Matches(senhaForte)
  novaSenha!: string;
}
