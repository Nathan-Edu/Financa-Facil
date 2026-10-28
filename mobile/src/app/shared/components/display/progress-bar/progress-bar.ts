import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  imports: [],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
})
export class ProgressBar {

  @Input({ required: true })
  value = 0;

  @Input()
  height = 8;

  @Input()
  showLabel = false;

  get progress(): number {
    return Math.max(0, Math.min(100, this.value));
  }

}