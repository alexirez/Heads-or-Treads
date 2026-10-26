import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-scriptor',
  imports: [RouterLink],
  template: `
    <p>Bot script editor coming soon.</p>
    <a routerLink="/">Back</a>
  `,
})
export class ScriptorScreen {}