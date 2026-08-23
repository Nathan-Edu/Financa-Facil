import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Usuario } from '../../../core/models/usuario.model';
import { UsuarioService } from '../../../core/services/usuario.service';

import { ToastService } from '../../../shared/components/feedback/toast/toast.service';

import { PageHeader } from '../../../shared/components/layout/page-header/page-header';
import { Card } from '../../../shared/components/layout/card/card';

import { Button } from '../../../shared/components/forms/button/button';
import {
  Select,
  SelectOption
} from '../../../shared/components/forms/select/select';

import { Badge } from '../../../shared/components/display/badge/badge';

@Component({
  selector: 'app-minha-conta',
  imports: [
    FormsModule,
    PageHeader,
    Card,
    Button,
    Select,
    Badge
  ],
  templateUrl: './minha-conta.html',
  styleUrl: './minha-conta.scss'
})
export class MinhaConta implements OnInit {

  usuario: Usuario = {
    id: 0,
    nome: '',
    email: '',
    perfilAtivo: 'pessoal',
    cpf: '',
    cnpj: ''
  };

  perfilOptions: SelectOption[] = [
    {
      label: 'Pessoa Física',
      value: 'pessoal'
    },
    {
      label: 'Pessoa Jurídica',
      value: 'empresa'
    }
  ];

  salvando = false;

  constructor(
    private usuarioService: UsuarioService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.carregarUsuario();
  }

  get iniciaisUsuario(): string {
    const nomes = this.usuario.nome
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (nomes.length === 0) {
      return 'U';
    }

    if (nomes.length === 1) {
      return nomes[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      nomes[0].charAt(0) +
      nomes[nomes.length - 1].charAt(0)
    ).toUpperCase();
  }

  get perfilFormatado(): string {
    return this.usuario.perfilAtivo === 'pessoal'
      ? 'Pessoa Física'
      : 'Pessoa Jurídica';
  }

  carregarUsuario(): void {
    this.usuarioService
      .buscarUsuarioAtual()
      .subscribe({
        next: (usuario: Usuario) => {
          this.usuario = {
            ...usuario,
            cpf: usuario.cpf ?? '',
            cnpj: usuario.cnpj ?? ''
          };
        },
        error: () => {
          this.toast.error(
            'Erro ao carregar os dados da conta.'
          );
        }
      });
  }

  alterarPerfil(perfil: string): void {
    if (
      perfil !== 'pessoal' &&
      perfil !== 'empresa'
    ) {
      return;
    }

    this.usuario.perfilAtivo = perfil;
  }

  salvar(): void {
    const nome = this.usuario.nome.trim();
    const email = this.usuario.email.trim();
    const cpf = (this.usuario.cpf ?? '').trim();
    const cnpj = (this.usuario.cnpj ?? '').trim();

    if (!nome) {
      this.toast.warning(
        'Informe o nome completo.'
      );

      return;
    }

    if (!this.emailValido(email)) {
      this.toast.warning(
        'Informe um e-mail válido.'
      );

      return;
    }

    if (
      this.usuario.perfilAtivo === 'pessoal' &&
      !cpf
    ) {
      this.toast.warning(
        'Informe o CPF.'
      );

      return;
    }

    if (
      this.usuario.perfilAtivo === 'empresa' &&
      !cnpj
    ) {
      this.toast.warning(
        'Informe o CNPJ.'
      );

      return;
    }

    const usuarioAtualizado: Usuario = {
      ...this.usuario,
      nome,
      email,
      cpf,
      cnpj
    };

    this.salvando = true;

    this.usuarioService
      .editar(usuarioAtualizado)
      .subscribe({
        next: (ok: boolean) => {
          this.salvando = false;

          if (!ok) {
            this.toast.error(
              'Não foi possível atualizar os dados da conta.'
            );

            return;
          }

          this.usuario = usuarioAtualizado;

          this.toast.success(
            'Dados da conta atualizados com sucesso.'
          );
        },
        error: () => {
          this.salvando = false;

          this.toast.error(
            'Erro ao atualizar os dados da conta.'
          );
        }
      });
  }

  private emailValido(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    );
  }
}