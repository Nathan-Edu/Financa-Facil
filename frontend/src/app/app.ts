import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/layout/navbar/navbar';
import { ToastContainer } from './shared/components/feedback/toast/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}