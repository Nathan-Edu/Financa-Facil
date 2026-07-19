import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

import { Card } from '../../../shared/components/layout/card/card';
import { Divider } from '../../../shared/components/layout/divider/divider';
import { Input } from '../../../shared/components/forms/input/input';
import { PasswordInput } from '../../../shared/components/forms/password-input/password-input';
import { Checkbox } from '../../../shared/components/forms/checkbox/checkbox';
import { Button } from '../../../shared/components/forms/button/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    Card,
    Divider,
    Input,
    PasswordInput,
    Checkbox,
    Button
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  email = '';
  senha = '';
  lembrar = false;

  carregando = false;
  erro = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  entrar(): void {
    this.erro = '';

    if (!this.email.trim() || !this.senha.trim()) {
      this.erro = 'Informe o e-mail e a senha.';
      return;
    }

    this.carregando = true;

    setTimeout(() => {
      const autenticado = this.authService.login(
        this.email.trim(),
        this.senha
      );

      this.carregando = false;

      if (!autenticado) {
        this.erro = 'E-mail ou senha inválidos.';
        return;
      }

      this.router.navigate(['/dashboard']);
    }, 600);
  }

  criarConta(): void {
    this.router.navigate(['/cadastro']);
  }

  recuperarSenha(): void {
    this.router.navigate(['/recuperar-senha']);
  }
}