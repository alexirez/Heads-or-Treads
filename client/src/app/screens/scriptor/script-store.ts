import { Injectable, signal } from '@angular/core';
import { BlockInstance } from './blocks/blocks';
import { Script, createScript, createStarterScript } from '../../scripting/script';

/** Holds every script the player has made. In memory only for now. */
@Injectable({ providedIn: 'root' })
export class ScriptStore {
  private readonly all = signal<readonly Script[]>([createStarterScript()]);
  private nextNumber = 2;

  readonly scripts = this.all.asReadonly();

  get(id: string): Script | undefined {
    return this.all().find((script) => script.id === id);
  }

  create(): Script {
    const script = createScript(`Script ${this.nextNumber++}`);
    this.all.update((list) => [...list, script]);
    return script;
  }

  remove(id: string): void {
    this.all.update((list) => list.filter((script) => script.id !== id));
  }

  rename(id: string, name: string): void {
    this.change(id, (script) => ({ ...script, name }));
  }

  setBlocks(id: string, blocks: readonly BlockInstance[]): void {
    this.change(id, (script) => ({ ...script, blocks }));
  }

  private change(id: string, fn: (script: Script) => Script): void {
    this.all.update((list) => list.map((script) => (script.id === id ? fn(script) : script)));
  }
}