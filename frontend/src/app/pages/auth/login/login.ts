import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { PerfilFinanceiroService } from '../../../core/services/perfil-financeiro.service';
import { Checkbox } from '../../../shared/components/forms/checkbox/checkbox';
import { Button } from '../../../shared/components/forms/button/button';
import { Input } from '../../../shared/components/forms/input/input';
import { PasswordInput } from '../../../shared/components/forms/password-input/password-input';
import { Card } from '../../../shared/components/layout/card/card';
import { Divider } from '../../../shared/components/layout/divider/divider';

@Component({ selector: 'app-login', standalone: true, imports: [Card, Divider, Input, PasswordInput, Checkbox, Button], templateUrl: './login.html', styleUrl: './login.scss' })
export class Login {
  email = '';
  senha = '';
  lembrar = false;
  carregando = false;
  erro = '';

  constructor(private readonly router: Router, private readonly authService: AuthService, private readonly perfis: PerfilFinanceiroService) {}

  entrar(): void {
    this.erro = '';
    if (!this.email.trim() || !this.senha.trim()) {
      this.erro = 'Informe o e-mail e a senha.';
      return;
    }
    this.carregando = true;
    this.authService.login(this.email.trim(), this.senha, this.lembrar).subscribe({
      next: () => {
        this.perfis.listar().subscribe({
          next: (perfis) => {
            this.carregando = false;
            void this.router.navigate([perfis.length ? '/dashboard' : '/perfis-financeiros']);
          },
          error: () => { this.carregando = false; this.erro = 'Não foi possível carregar seus perfis.'; }
        });
      },
      error: () => { this.carregando = false; this.erro = 'E-mail ou senha inválidos.'; }
    });
  }

  criarConta(): void { void this.router.navigate(['/cadastro']); }
  recuperarSenha(): void { void this.router.navigate(['/recuperar-senha']); }
}
