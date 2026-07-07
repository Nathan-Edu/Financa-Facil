import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alert-item',
  imports: [MatIconModule],
  templateUrl: './alert-item.html',
  styleUrl: './alert-item.scss',
})
export class AlertItem {
  @Input() message = '';
  @Input() type: 'danger' | 'warning' | 'success' | 'info' = 'info';

  get icon(): string {
    switch (this.type) {
      case 'danger':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'check_circle';
      default:
        return 'info';
    }
  }
}