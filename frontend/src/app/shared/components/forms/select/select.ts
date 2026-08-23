import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './select.html',
  styleUrl: './select.scss',
})
export class Select {
  @Input() label = '';
  @Input() value = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() hint = '';

  @Input()
  set options(options: (string | SelectOption)[]) {
    this._options = options.map((item) =>
      typeof item === 'string'
        ? { label: item, value: item }
        : item
    );
  }

  get options(): SelectOption[] {
    return this._options;
  }

  private _options: SelectOption[] = [];

  @Output() valueChange = new EventEmitter<string>();

  onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.value = value;
    this.valueChange.emit(value);
  }
}