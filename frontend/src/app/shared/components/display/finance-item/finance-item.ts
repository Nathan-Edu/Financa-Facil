import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

import { Badge } from '../badge/badge';
import { Button } from '../../forms/button/button';

@Component({
  selector: 'app-finance-item',
  imports: [
    MatIconModule,
    Badge,
    Button
  ],
  templateUrl: './finance-item.html',
  styleUrl: './finance-item.scss'
})
export class FinanceItem {
  @Input() title = '';
  @Input() category = '';
  @Input() date = '';
  @Input() value = '';

  @Input()
  type: 'income' | 'expense' = 'income';

  @Output()
  edit = new EventEmitter<void>();

  @Output()
  delete = new EventEmitter<void>();

  get icon(): string {
    return this.type === 'income'
      ? 'trending_up'
      : 'trending_down';
  }

  get dataFormatada(): string {
  if (!this.date) {
    return '';
  }

  if (this.date.includes('/')) {
    return this.date;
  }

  const [ano, mes, dia] =
    this.date.split('-');

  return `${dia}/${mes}/${ano}`;
}
}