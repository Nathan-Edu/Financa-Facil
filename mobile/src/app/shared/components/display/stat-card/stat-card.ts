import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  imports: [MatIconModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  @Input() title = '';
  @Input() value = '';
  @Input() subtitle = '';
  @Input() icon = '';

  @Input() color:
    | 'primary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'violet' = 'primary';
}