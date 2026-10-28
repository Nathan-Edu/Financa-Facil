import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-divider',
  imports: [],
  templateUrl: './divider.html',
  styleUrl: './divider.scss'
})
export class Divider {
  @Input() text = '';
}