import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './select.html',
  styleUrl: './select.scss',
})
export class Select {

  @Input() label = '';

  @Input() options: string[] = [];

  @Input() value = '';

  @Output() valueChange = new EventEmitter<string>();

  onChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;

    this.value = value;
    this.valueChange.emit(value);
  }

}