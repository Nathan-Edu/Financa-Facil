import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-transaction-item',
  imports: [MatIconModule],
  templateUrl: './transaction-item.html',
  styleUrl: './transaction-item.scss',
})
export class TransactionItem {
  @Input() title = '';
  @Input() date = '';
  @Input() value = '';
  @Input() type: 'income' | 'expense' = 'expense';
}