import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { Button } from '../../../shared/components/forms/button/button';
import { PasswordInput } from '../../../shared/components/forms/password-input/password-input';
import { Card } from '../../../shared/components/layout/card/card';

@Component({ selector: 'app-redefinir-senha', imports: [Card, PasswordInput, Button], templateUrl: './redefinir-senha.html', styleUrl: '../recuperar-senha/recuperar-senha.scss' })
export class RedefinirSenha {
  novaSenha = '';
  confirmarSenha = '';
  carregando = false;
  concluido = false;
  erro = '';
  private readonly token: string;

  constructor(route: ActivatedRoute, private readonly router: Router, private readonly auth: AuthService) {
    this.token = route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) this.erro = 'Link de redefinição inválido.';
  }

  salvar(): void {
    if (!this.token || this.novaSenha.length < 8 || this.novaSenha !== this.confirmarSenha) {
      this.erro = 'Informe duas senhas iguais com pelo menos 8 caracteres.';
      return;
    }
    this.carregando = true;
    this.erro = '';
    this.auth.redefinirSenha(this.token, this.novaSenha).subscribe({
      next: () => { this.carregando = false; this.concluido = true; },
      error: () => { this.carregando = false; this.erro = 'O link é inválido ou expirou.'; }
    });
  }

  voltarLogin(): void { void this.router.navigate(['/login']); }
}
