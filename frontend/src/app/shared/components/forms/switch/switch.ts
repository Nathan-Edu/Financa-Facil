import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-switch',
  imports: [],
  templateUrl: './switch.html',
  styleUrl: './switch.scss'
})
export class Switch {

  @Input() label = '';

  @Input() description = '';

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