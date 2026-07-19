import {
  Component,
  EventEmitter,
  Input as AngularInput,
  Output
} from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-input',
  imports: [
    MatIconModule
  ],
  templateUrl: './input.html',
  styleUrl: './input.scss'
})
export class Input {
  @AngularInput() label = '';
  @AngularInput() placeholder = '';
  @AngularInput() type: 'text' | 'email' | 'tel' | 'number' = 'text';

  @AngularInput() value = '';
  @Output() valueChange = new EventEmitter<string>();

  @AngularInput() icon = '';
  @AngularInput() hint = '';
  @AngularInput() error = '';

  @AngularInput() required = false;
  @AngularInput() disabled = false;
  @AngularInput() readonly = false;
  @AngularInput() autocomplete = 'off';
  @AngularInput() inputMode = '';

  atualizarValor(event: Event): void {
    const elemento = event.target as HTMLInputElement;

    this.value = elemento.value;
    this.valueChange.emit(this.value);
  }
}