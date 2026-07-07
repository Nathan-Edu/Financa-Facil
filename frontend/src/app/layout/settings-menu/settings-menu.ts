import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-settings-menu',
  imports: [
    MatIconModule,
    MatMenuModule,
    MatButtonModule
  ],
  templateUrl: './settings-menu.html',
  styleUrl: './settings-menu.scss',
})
export class SettingsMenu {
  perfilAtual = 'Pessoal';
  temaAtual = 'Dark';

  alterarPerfil(perfil: string): void {
    this.perfilAtual = perfil;
  }

  alterarTema(tema: string): void {
    this.temaAtual = tema;

    document.body.classList.remove(
      'theme-dark',
      'theme-light',
      'theme-green',
      'theme-violet'
    );

    document.body.classList.add(`theme-${tema.toLowerCase()}`);
  }

  sair(): void {
    console.log('Usuário saiu do sistema');
  }
}