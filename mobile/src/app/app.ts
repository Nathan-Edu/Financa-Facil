import { IonApp } from '@ionic/angular/standalone';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastContainer } from './shared/components/feedback/toast/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer, IonApp],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
