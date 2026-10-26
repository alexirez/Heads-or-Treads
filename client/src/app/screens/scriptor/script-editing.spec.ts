import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../../app.routes';
import { BLOCK_DEFS, DragData } from './blocks/blocks';
import { ScriptEditorScreen } from './script-editor/script-editor';
import { DropTarget, ScriptEditing } from './script-editing';
import { ScriptStore } from './script-store';

// A stand-in for the event CDK emits when the player drops a block.
function dropEvent(target: DropTarget, item: DragData, currentIndex = 0) {
  return {
    container: { data: target },
    item: { data: item },
    currentIndex,
  } as unknown as CdkDragDrop<DropTarget, DropTarget, DragData>;
}

describe('script editor', () => {
  let harness: RouterTestingHarness;
  let editing: ScriptEditing;
  let store: ScriptStore;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    harness = await RouterTestingHarness.create('/scriptor/starter');
    store = TestBed.inject(ScriptStore);
    // The editor provides ScriptEditing itself, so grab the instance from its injector.
    const component = harness.routeDebugElement!.componentInstance as ScriptEditorScreen;
    editing = (component as unknown as { editing: ScriptEditing }).editing;
  });

  const types = () => editing.blocks().map((b) => b.type);

  it('shows the starter script, including the block plugged into Aim at', () => {
    const el: HTMLElement = harness.routeNativeElement!;
    // 3 stacked blocks + 1 nested + 6 palette copies
    expect(el.querySelectorAll('.stack app-block').length).toBe(4);
    expect(el.querySelectorAll('.palette app-block').length).toBe(6);
  });

  it('copies a block from the palette into the stack, never above the hat', () => {
    editing.drop(dropEvent({ area: 'stack' }, BLOCK_DEFS['shoot'], 0));
    expect(types()).toEqual(['on-game-start', 'shoot', 'aim-at', 'shoot']);
  });

  it('plugs a palette value block into a slot and refuses a statement there', () => {
    const aim = editing.blocks()[1]!;
    const slot: DropTarget = { area: 'slot', parentId: aim.id, slot: 'at', occupied: false };
    editing.drop(dropEvent(slot, BLOCK_DEFS['shoot']));
    expect(editing.blocks()[1]!.inputs['at']?.type).toBe('target'); // unchanged
    editing.drop(dropEvent(slot, BLOCK_DEFS['angle']));
    expect(editing.blocks()[1]!.inputs['at']?.type).toBe('angle');
  });

  it('deletes a block dropped on the palette, but keeps the hat', () => {
    editing.drop(dropEvent({ area: 'palette' }, editing.blocks()[2]!)); // shoot
    expect(types()).toEqual(['on-game-start', 'aim-at']);
    editing.drop(dropEvent({ area: 'palette' }, editing.blocks()[0]!)); // hat
    expect(types()).toEqual(['on-game-start', 'aim-at']);
  });

  it('moves a value block out of a slot and back onto the palette', () => {
    const inner = editing.blocks()[1]!.inputs['at']!;
    editing.drop(dropEvent({ area: 'palette' }, inner));
    expect(editing.blocks()[1]!.inputs['at']).toBeNull();
    expect(store.get('starter')!.blocks.length).toBe(3);
  });
});