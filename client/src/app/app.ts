import { Component, signal } from '@angular/core';
import { HomeScreen } from './screens/home';
import { ArenaScreen } from './screens/arena';
import { ScriptorScreen } from './screens/scriptor';

type Screen = 'home' | 'arena' | 'scriptor';

@Component({
  selector: 'app-root',
  imports: [HomeScreen, ArenaScreen, ScriptorScreen],
  template: `
    @switch (screen()) {
      @case ('home') {
        <app-home (play)="screen.set('arena')" (openScriptor)="screen.set('scriptor')" />
      }
      @case ('arena') {
        <app-arena (back)="screen.set('home')" />
      }
      @case ('scriptor') {
        <app-scriptor (back)="screen.set('home')" />
      }
    }
  `,
})
export class App {
  screen = signal<Screen>('home');
}