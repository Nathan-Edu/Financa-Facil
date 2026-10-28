import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-textarea',
  imports: [],
  templateUrl: './textarea.html',
  styleUrl: './textarea.scss',
})
export class Textarea {

  @Input() label = '';

  @Input() placeholder = '';

  @Input() value = '';

  @Input() rows = 4;

  @Input() disabled = false;

  @Input() required = false;

  @Output() valueChange = new EventEmitter<string>();

}