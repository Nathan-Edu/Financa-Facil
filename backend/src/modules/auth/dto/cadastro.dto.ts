import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';

export class CadastroDto {
  @IsString()
  @Length(3, 120)
  nome!: string;

  @IsEmail({}, { message: 'O e-mail informado é inválido' })
  @MaxLength(160)
  email!: string;

  @IsString()
  @Length(8, 72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message: 'A senha deve conter maiúscula, minúscula, número e caractere especial',
  })
  senha!: string;
}
