import { Component, output } from '@angular/core';

@Component({
  selector: 'app-arena',
  template: `
    <p>Arena coming soon.</p>
    <button (click)="back.emit()">Back</button>
  `,
})
export class ArenaScreen {
  back = output<void>();
}