import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Card } from '../../../shared/components/layout/card/card';
import { Divider } from '../../../shared/components/layout/divider/divider';

import { Input } from '../../../shared/components/forms/input/input';
import { PasswordInput } from '../../../shared/components/forms/password-input/password-input';
import { Checkbox } from '../../../shared/components/forms/checkbox/checkbox';
import { Button } from '../../../shared/components/forms/button/button';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    Card,
    Divider,
    Input,
    PasswordInput,
    Checkbox,
    Button
  ],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss'
})
export class Cadastro {
  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';
  aceitouTermos = false;
  carregando = false;

  constructor(private router: Router) {}

  cadastrar(): void {
    if (!this.nome || !this.email || !this.senha || !this.confirmarSenha) {
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      return;
    }

    if (!this.aceitouTermos) {
      return;
    }

    this.carregando = true;

    setTimeout(() => {
      this.carregando = false;
      this.router.navigate(['/login']);
    }, 700);
  }

  voltarLogin(): void {
    this.router.navigate(['/login']);
  }
}