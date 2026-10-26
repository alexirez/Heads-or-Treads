import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  BLOCK_DEFS,
  BlockInstance,
  CURRENT_OPTIONS,
  DragData,
  TARGET_OPTIONS,
  kindOf,
} from './blocks';
import { DropTarget, ScriptEditing } from '../script-editing';

/** Draws one block (and, recursively, whatever is plugged into its slot). */
@Component({
  selector: 'app-block',
  imports: [CdkDrag, CdkDropList],
  templateUrl: './block.html',
  styleUrl: './block.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-type]': 'block().type',
    '[attr.data-kind]': 'kind()',
  },
})
export class Block {
  readonly block = input.required<BlockInstance>();
  /** Palette copies are display-only: their fields are disabled and their slots accept nothing. */
  readonly preview = input(false);

  protected readonly editing = inject(ScriptEditing);

  protected readonly targetOptions = TARGET_OPTIONS;
  protected readonly currentOptions = CURRENT_OPTIONS;

  protected readonly kind = computed(() => kindOf(this.block()));
  protected readonly label = computed(() => BLOCK_DEFS[this.block().type].label);
  protected readonly child = computed(() => this.block().inputs['at'] ?? null);
  protected readonly slotTarget = computed<DropTarget>(() => ({
    area: 'slot',
    parentId: this.block().id,
    slot: 'at',
    occupied: this.child() !== null,
  }));

  /** Slots hold one value block (Angle, Target or Current) and nothing else. */
  protected readonly canEnterSlot = (drag: CdkDrag<DragData>, drop: CdkDropList): boolean => {
    const target = drop.data as DropTarget;
    return kindOf(drag.data) === 'value' && target.area === 'slot' && !target.occupied;
  };

  protected setField(name: string, value: string): void {
    this.editing.patchFields(this.block().id, { [name]: value });
  }

  protected setDegrees(input: HTMLInputElement): void {
    const raw = Number(input.value);
    if (!Number.isFinite(raw)) {
      input.value = String(this.block().fields['degrees']);
      return;
    }
    const degrees = ((Math.round(raw) % 360) + 360) % 360;
    input.value = String(degrees); // show the cleaned-up value even if state didn't change
    this.editing.patchFields(this.block().id, { degrees });
  }
}