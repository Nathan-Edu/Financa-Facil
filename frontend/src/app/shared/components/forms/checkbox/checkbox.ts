import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-checkbox',
  imports: [],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss'
})
export class Checkbox {

  @Input() label = '';

  @Input() checked = false;

  @Input() disabled = false;

  @Output() checkedChange =
    new EventEmitter<boolean>();

  toggle(): void {

    if (this.disabled) {

      return;

    }

    this.checked = !this.checked;

    this.checkedChange.emit(this.checked);

  }

}