import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('starts on the home screen', async () => {
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Welcome!');
  });

  it('navigates to the arena', async () => {
    const harness = await RouterTestingHarness.create('/arena');
    expect(harness.routeNativeElement?.textContent).toContain('Arena');
  });
});