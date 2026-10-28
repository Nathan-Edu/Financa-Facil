import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { Button } from '../../../shared/components/forms/button/button';
import { Input } from '../../../shared/components/forms/input/input';
import { Card } from '../../../shared/components/layout/card/card';
import { Divider } from '../../../shared/components/layout/divider/divider';

@Component({ selector: 'app-recuperar-senha', standalone: true, imports: [Card, Divider, Input, Button], templateUrl: './recuperar-senha.html', styleUrl: './recuperar-senha.scss' })
export class RecuperarSenha {
  email = '';
  carregando = false;
  enviado = false;
  erro = '';

  constructor(private readonly router: Router, private readonly auth: AuthService) {}

  enviarLink(): void {
    if (!this.email.trim()) return;
    this.carregando = true;
    this.erro = '';
    this.auth.esqueciSenha(this.email.trim()).subscribe({
      next: (resposta) => {
        this.carregando = false;
        if (resposta.tokenDesenvolvimento) {
          void this.router.navigate(['/redefinir-senha'], { queryParams: { token: resposta.tokenDesenvolvimento } });
          return;
        }
        this.enviado = true;
      },
      error: () => { this.carregando = false; this.erro = 'Não foi possível enviar as instruções.'; }
    });
  }

  voltarLogin(): void { void this.router.navigate(['/login']); }
}
