import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-date-input',
  imports: [],
  templateUrl: './date-input.html',
  styleUrl: './date-input.scss',
})
export class DateInput {

  @Input() label = '';

  @Input() placeholder = '';

  @Input() value = '';

  @Input() disabled = false;

  @Input() required = false;

  @Output() valueChange = new EventEmitter<string>();

}