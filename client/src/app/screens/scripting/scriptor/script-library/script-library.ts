import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { countBlocks } from '../../block-tree';
import { ScriptStore } from '../script-store';

@Component({
  selector: 'app-script-library',
  imports: [RouterLink],
  templateUrl: './script-library.html',
  styleUrl: './script-library.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScriptLibraryScreen {
  protected readonly store = inject(ScriptStore);
  private readonly router = inject(Router);

  protected readonly countBlocks = countBlocks;

  protected create(): void {
    const script = this.store.create();
    void this.router.navigate(['/scriptor', script.id]);
  }
}