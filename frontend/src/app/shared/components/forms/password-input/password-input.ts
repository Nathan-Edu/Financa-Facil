import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-password-input',
  imports: [
    MatIconModule
  ],
  templateUrl: './password-input.html',
  styleUrl: './password-input.scss'
})
export class PasswordInput {

  @Input() label = '';
  @Input() placeholder = 'Digite sua senha';

  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  @Input() hint = '';
  @Input() error = '';

  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() autocomplete = 'current-password';

  mostrarSenha = false;

  atualizarValor(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.value = input.value;

    this.valueChange.emit(this.value);

  }

  alternarVisibilidade(): void {

    this.mostrarSenha = !this.mostrarSenha;

  }

}