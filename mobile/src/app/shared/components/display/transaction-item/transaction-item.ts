import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-transaction-item',
  imports: [
    MatIconModule
  ],
  templateUrl: './transaction-item.html',
  styleUrl: './transaction-item.scss'
})
export class TransactionItem {
  @Input() title = '';
  @Input() category = '';
  @Input() date = '';
  @Input() value = '';

  @Input() icon = 'payments';
  @Input() color = '#64748b';

  @Input()
  type: 'income' | 'expense' = 'expense';

  get dataFormatada(): string {
    if (!this.date) {
      return '-';
    }

    if (this.date.includes('/')) {
      return this.date;
    }

    const [ano, mes, dia] = this.date.split('-');

    return `${dia}/${mes}/${ano}`;
  }
}