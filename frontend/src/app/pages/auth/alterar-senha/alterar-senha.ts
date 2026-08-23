import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';

import { UsuarioService } from '../../../core/services/usuario.service';
import { ToastService } from '../../../shared/components/feedback/toast/toast.service';

import { PageHeader } from '../../../shared/components/layout/page-header/page-header';
import { Card } from '../../../shared/components/layout/card/card';
import { Button } from '../../../shared/components/forms/button/button';

@Component({
  selector: 'app-alterar-senha',
  imports: [
  FormsModule,
  MatIconModule,
  PageHeader,
  Card,
  Button
],
  templateUrl: './alterar-senha.html',
  styleUrl: './alterar-senha.scss'
})
export class AlterarSenha {

  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';

  mostrarSenhaAtual = false;
  mostrarNovaSenha = false;
  mostrarConfirmacaoSenha = false;

  salvando = false;

  constructor(
    private usuarioService: UsuarioService,
    private toastService: ToastService
  ) {}

  salvar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.salvando = true;

    this.usuarioService
      .alterarSenha(
        this.senhaAtual,
        this.novaSenha
      )
      .subscribe({
        next: (sucesso: boolean) => {
          this.salvando = false;

          if (!sucesso) {
            this.toastService.error(
              'A senha atual está incorreta.'
            );

            return;
          }

          this.toastService.success(
            'Senha alterada com sucesso.'
          );

          this.limparFormulario();
        },
        error: () => {
          this.salvando = false;

          this.toastService.error(
            'Não foi possível alterar a senha.'
          );
        }
      });
  }

  private validarFormulario(): boolean {
    if (!this.senhaAtual.trim()) {
      this.toastService.warning(
        'Informe a senha atual.'
      );

      return false;
    }

    if (!this.novaSenha.trim()) {
      this.toastService.warning(
        'Informe a nova senha.'
      );

      return false;
    }

    if (this.novaSenha.length < 8) {
      this.toastService.warning(
        'A nova senha deve ter pelo menos 8 caracteres.'
      );

      return false;
    }

    if (
      this.novaSenha !==
      this.confirmarSenha
    ) {
      this.toastService.warning(
        'A confirmação da senha não corresponde.'
      );

      return false;
    }

    if (
      this.senhaAtual ===
      this.novaSenha
    ) {
      this.toastService.warning(
        'A nova senha deve ser diferente da senha atual.'
      );

      return false;
    }

    return true;
  }

  private limparFormulario(): void {
    this.senhaAtual = '';
    this.novaSenha = '';
    this.confirmarSenha = '';

    this.mostrarSenhaAtual = false;
    this.mostrarNovaSenha = false;
    this.mostrarConfirmacaoSenha = false;
  }

}