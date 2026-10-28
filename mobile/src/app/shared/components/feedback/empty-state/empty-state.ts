import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  imports: [MatIconModule],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyState {

  @Input() icon = 'folder_open';

  @Input() title = 'Nenhum registro encontrado';

  @Input() description = 'Não existem informações para exibir no momento.';

}