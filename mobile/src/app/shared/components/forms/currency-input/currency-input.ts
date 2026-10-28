import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-currency-input',
  imports: [],
  templateUrl: './currency-input.html',
  styleUrl: './currency-input.scss',
})
export class CurrencyInput {

  @Input() label = '';

  @Input() value = 0;
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<number>();

  displayValue = 'R$ 0,00';

  ngOnInit() {
    this.updateDisplay();
  }

  onInput(event: Event) {

    const input = event.target as HTMLInputElement;

    const numbers = input.value.replace(/\D/g, '');

    this.value = Number(numbers) / 100;

    this.updateDisplay();

    this.valueChange.emit(this.value);

  }

  private updateDisplay() {

    this.displayValue = this.value.toLocaleString('pt-BR', {

      style: 'currency',

      currency: 'BRL'

    });

  }

}
