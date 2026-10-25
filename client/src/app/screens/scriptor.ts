import { Component, output } from '@angular/core';

@Component({
  selector: 'app-scriptor',
  template: `
    <p>Bot script editor coming soon.</p>
    <button (click)="back.emit()">Back</button>
  `,
})
export class ScriptorScreen {
  back = output<void>();
}