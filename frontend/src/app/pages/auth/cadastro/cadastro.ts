import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { Button } from '../../../shared/components/forms/button/button';
import { Checkbox } from '../../../shared/components/forms/checkbox/checkbox';
import { Input } from '../../../shared/components/forms/input/input';
import { PasswordInput } from '../../../shared/components/forms/password-input/password-input';
import { Card } from '../../../shared/components/layout/card/card';
import { Divider } from '../../../shared/components/layout/divider/divider';

@Component({ selector: 'app-cadastro', standalone: true, imports: [Card, Divider, Input, PasswordInput, Checkbox, Button], templateUrl: './cadastro.html', styleUrl: './cadastro.scss' })
export class Cadastro {
  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';
  aceitouTermos = false;
  carregando = false;
  erro = '';

  constructor(private readonly router: Router, private readonly auth: AuthService) {}

  cadastrar(): void {
    this.erro = '';
    if (!this.nome.trim() || !this.email.trim() || !this.senha || !this.confirmarSenha) { this.erro = 'Preencha todos os campos.'; return; }
    if (this.senha !== this.confirmarSenha) { this.erro = 'As senhas não correspondem.'; return; }
    if (this.senha.length < 8) { this.erro = 'A senha deve ter pelo menos 8 caracteres.'; return; }
    if (!this.aceitouTermos) { this.erro = 'Aceite os termos de uso.'; return; }
    this.carregando = true;
    this.auth.cadastrar(this.nome.trim(), this.email.trim(), this.senha).subscribe({
      next: () => { this.carregando = false; void this.router.navigate(['/perfis-financeiros']); },
      error: () => { this.carregando = false; this.erro = 'Não foi possível criar a conta. Verifique os dados.'; }
    });
  }

  voltarLogin(): void { void this.router.navigate(['/login']); }
}
