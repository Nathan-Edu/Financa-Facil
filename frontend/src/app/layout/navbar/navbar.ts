import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SettingsMenu } from '../settings-menu/settings-menu';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    MatIconModule,
    SettingsMenu
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {}