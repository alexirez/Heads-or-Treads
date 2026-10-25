import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  it('starts on the home screen', async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.componentInstance.screen()).toBe('home');
  });
});