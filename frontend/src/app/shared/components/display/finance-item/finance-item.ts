import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Badge } from '../badge/badge';
import { Button } from '../../forms/button/button';

@Component({
  selector: 'app-finance-item',
  imports: [Badge, Button],
  templateUrl: './finance-item.html',
  styleUrl: './finance-item.scss',
})
export class FinanceItem {
  @Input() title = '';
  @Input() category = '';
  @Input() date = '';
  @Input() value = '';
  @Input() type: 'income' | 'expense' = 'income';

  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}