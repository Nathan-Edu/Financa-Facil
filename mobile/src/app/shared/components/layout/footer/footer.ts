import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  anoAtual = new Date().getFullYear();

  versao = '1.0.0';
  ambiente: 'PRD' | 'PRD' = 'PRD';
}