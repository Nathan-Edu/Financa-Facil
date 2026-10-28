import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-button',
  imports: [MatIconModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  @Input() color:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'outline'
    | 'ghost' = 'primary';

  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  @Input() appearance: 'default' | 'icon' = 'default';

  @Input() icon = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
}