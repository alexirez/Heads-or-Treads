import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BLOCK_DEFS,
  DragData,
  PALETTE_SECTIONS,
  createBlock,
  isInstance,
  kindOf,
} from '../blocks/blocks';
import { Block } from '../blocks/block';
import { DropTarget, ScriptEditing } from '../script-editing';

@Component({
  selector: 'app-script-editor',
  imports: [RouterLink, CdkDropListGroup, CdkDropList, CdkDrag, Block],
  providers: [ScriptEditing],
  templateUrl: './script-editor.html',
  styleUrl: './script-editor.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScriptEditorScreen {
  protected readonly editing = inject(ScriptEditing);

  /** The palette's blocks are built once; dragging one creates a fresh copy in the script. */
  protected readonly sections = PALETTE_SECTIONS.map((section) => ({
    title: section.title,
    items: section.types.map((type) => ({ def: BLOCK_DEFS[type], preview: createBlock(type) })),
  }));

  protected readonly paletteTarget: DropTarget = { area: 'palette' };
  protected readonly stackTarget: DropTarget = { area: 'stack' };

  protected readonly canEnterPalette = (drag: CdkDrag<DragData>): boolean => isInstance(drag.data);
  protected readonly canEnterStack = (drag: CdkDrag<DragData>): boolean =>
    kindOf(drag.data) !== 'value';
  /** Nothing but the hat may sit at the top of the stack. */
  protected readonly canSort = (index: number, drag: CdkDrag<DragData>): boolean =>
    index > 0 || kindOf(drag.data) === 'hat';

  protected isHat(block: { type: DragData['type'] }): boolean {
    return kindOf(block) === 'hat';
  }
}