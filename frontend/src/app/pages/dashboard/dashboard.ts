import { Component } from '@angular/core';
import { Button } from '../../shared/components/button/button';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { Card } from '../../shared/components/card/card';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { TransactionItem } from '../../shared/components/transaction-item/transaction-item';

@Component({
  selector: 'app-dashboard',
  imports: [
    Button,
    StatCard,
    Card,
    PageHeader,
    TransactionItem
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}