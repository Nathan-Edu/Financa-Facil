import { Component } from '@angular/core';
import { Button } from '../../shared/components/forms/button/button';
import { StatCard } from '../../shared/components/display/stat-card/stat-card';
import { Card } from '../../shared/components/layout/card/card';
import { PageHeader } from '../../shared/components/layout/page-header/page-header';
import { TransactionItem } from '../../shared/components/display/transaction-item/transaction-item';
import { AlertItem } from '../../shared/components/display/alert-item/alert-item';

@Component({
  selector: 'app-dashboard',
  imports: [
    Button,
    StatCard,
    Card,
    PageHeader,
    TransactionItem,
    AlertItem

  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}