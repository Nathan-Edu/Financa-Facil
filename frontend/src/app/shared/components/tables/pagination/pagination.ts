import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Button } from '../../forms/button/button';

@Component({
  selector: 'app-pagination',
  imports: [Button],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  @Input() currentPage = 1;
  @Input() totalPages = 1;

  @Output() pageChange = new EventEmitter<number>();

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.pageChange.emit(page);
  }
}