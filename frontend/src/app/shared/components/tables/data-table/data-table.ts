import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Button } from '../../forms/button/button';
import { Loading } from '../../feedback/loading/loading';
import { EmptyState } from '../../feedback/empty-state/empty-state';
import { Pagination } from '../pagination/pagination';

export interface DataTableColumn {
  field: string;
  header: string;
}

@Component({
  selector: 'app-data-table',
  imports: [
    Button,
    Loading,
    EmptyState,
    Pagination
  ],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {
  @Input() columns: DataTableColumn[] = [];
  @Input() data: any[] = [];

  @Input() loading = false;

  @Input() currentPage = 1;
  @Input() totalPages = 1;

  @Input() showActions = true;

  @Output() pageChange = new EventEmitter<number>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
}