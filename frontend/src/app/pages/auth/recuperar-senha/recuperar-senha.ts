import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Card } from '../../../shared/components/layout/card/card';
import { Divider } from '../../../shared/components/layout/divider/divider';

import { Input } from '../../../shared/components/forms/input/input';
import { Button } from '../../../shared/components/forms/button/button';

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [
    Card,
    Divider,
    Input,
    Button
  ],
  templateUrl: './recuperar-senha.html',
  styleUrl: './recuperar-senha.scss'
})
export class RecuperarSenha {
  email = '';
  carregando = false;
  enviado = false;

  constructor(private router: Router) {}

  enviarLink(): void {
    if (!this.email.trim()) {
      return;
    }

    this.carregando = true;

    setTimeout(() => {
      this.carregando = false;
      this.enviado = true;
    }, 700);
  }

  voltarLogin(): void {
    this.router.navigate(['/login']);
  }
}