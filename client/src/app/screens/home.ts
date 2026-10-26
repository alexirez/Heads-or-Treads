import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <h1>Welcome!</h1>
    <a routerLink="/arena">Play</a>
    <a routerLink="/scriptor">Bot scripts</a>
  `,
})
export class HomeScreen {}