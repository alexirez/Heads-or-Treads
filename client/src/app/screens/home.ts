import { Component, output } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <h1>Welcome!</h1>
    <button (click)="play.emit()">Play</button>
    <button (click)="openScriptor.emit()">Bot scripts</button>
  `,
})
export class HomeScreen {
  play = output<void>();
  openScriptor = output<void>();
}