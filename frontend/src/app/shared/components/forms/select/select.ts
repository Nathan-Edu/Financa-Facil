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
  @Input() required = false;
  @Input() disabled = false;
  @Input() hint = '';

  @Output() valueChange = new EventEmitter<string>();

  onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.value = value;
    this.valueChange.emit(value);
  }
}