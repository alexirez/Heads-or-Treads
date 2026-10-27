import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { insertAt, removeBlock, setInput, updateBlock } from '../../scripting/block-tree';
import { DragData, createBlock, isInstance, kindOf } from '../../scripting/blocks';
import { ScriptStore } from './script-store';

/** Describes a place a block can be dropped. Passed to each list as [cdkDropListData]. */
export type DropTarget =
  | { readonly area: 'palette' }
  | { readonly area: 'stack' }
  | {
      readonly area: 'slot';
      readonly parentId: string;
      readonly slot: string;
      readonly occupied: boolean;
    };

/**
 * Provided by the editor screen (not root), so every block inside the editor shares one instance
 * that is tied to the script in the current URL.
 */
@Injectable()
export class ScriptEditing {
  private readonly store = inject(ScriptStore);
  private readonly route = inject(ActivatedRoute);

  private readonly scriptId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? '')), {
    initialValue: '',
  });

  readonly script = computed(() => this.store.get(this.scriptId()));
  readonly blocks = computed(() => this.script()?.blocks ?? []);
  readonly hasHat = computed(() => this.blocks().some((block) => kindOf(block) === 'hat'));

  rename(name: string): void {
    const script = this.script();
    const trimmed = name.trim();
    if (script && trimmed) this.store.rename(script.id, trimmed);
  }

  patchFields(blockId: string, patch: Record<string, string | number>): void {
    const script = this.script();
    if (!script) return;
    const blocks = updateBlock(script.blocks, blockId, (block) => ({
      ...block,
      fields: { ...block.fields, ...patch },
    }));
    this.store.setBlocks(script.id, blocks);
  }

  /** One handler for every drop list (palette, stack and slots). */
  drop(event: CdkDragDrop<DropTarget, DropTarget, DragData>): void {
    const script = this.script();
    if (!script) return;

    const target = event.container.data;
    const dragged = event.item.data;
    const kind = kindOf(dragged);

    // Take the block out of wherever it was, or make a fresh one if it came from the palette.
    const source = isInstance(dragged)
      ? removeBlock(script.blocks, dragged.id)
      : { blocks: [...script.blocks], removed: undefined };

    if (target.area === 'palette') {
      // Dropping an existing block on the palette deletes it (the hat can't be dragged at all).
      if (isInstance(dragged) && kind !== 'hat') this.store.setBlocks(script.id, source.blocks);
      return;
    }

    const block = isInstance(dragged) ? source.removed : createBlock(dragged.type);
    if (!block) return;

    if (target.area === 'stack') {
      if (kind === 'value') return;
      let index = event.currentIndex;
      const firstIsHat = source.blocks[0] !== undefined && kindOf(source.blocks[0]) === 'hat';
      if (firstIsHat && kind !== 'hat') index = Math.max(index, 1); // never above the hat
      this.store.setBlocks(script.id, insertAt(source.blocks, index, block));
      return;
    }

    if (kind !== 'value') return;
    this.store.setBlocks(script.id, setInput(source.blocks, target.parentId, target.slot, block));
  }
}
