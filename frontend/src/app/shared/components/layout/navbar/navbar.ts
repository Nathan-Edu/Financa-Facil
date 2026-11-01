import { Component } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../../core/services/auth.service';
import { SettingsMenu } from '../settings-menu/settings-menu';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    SettingsMenu
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {

  constructor(private readonly auth: AuthService) {}

  get administrador(): boolean {
    return this.auth.obterUsuario()?.tipo === 'ADMINISTRADOR';
  }
}