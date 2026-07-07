import { Component } from '@angular/core';
import { Button } from '../../shared/components/button/button';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { Card } from '../../shared/components/card/card';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { TransactionItem } from '../../shared/components/transaction-item/transaction-item';
import { AlertItem } from '../../shared/components/alert-item/alert-item';
import { Badge } from '../../shared/components/badge/badge';
import { SearchInput } from '../../shared/components/search-input/search-input';
import { CurrencyInput } from '../../shared/components/currency-input/currency-input';

@Component({
  selector: 'app-dashboard',
  imports: [
    Button,
    StatCard,
    Card,
    PageHeader,
    TransactionItem,
    AlertItem,
    Badge,
    SearchInput,
    CurrencyInput
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}