import { createBlock } from './blocks';
import { countBlocks, insertAt, removeBlock, setInput, updateBlock } from './block-tree';

describe('block tree', () => {
  it('inserts at an index without mutating the original', () => {
    const a = createBlock('shoot');
    const b = createBlock('aim-at');
    const original = [a];
    const result = insertAt(original, 0, b);
    expect(result.map((x) => x.id)).toEqual([b.id, a.id]);
    expect(original.length).toBe(1);
  });

  it('plugs a value block into a slot and removes it again', () => {
    const aim = createBlock('aim-at');
    const angle = createBlock('angle');
    const plugged = setInput([aim], aim.id, 'at', angle);
    expect(plugged[0]!.inputs['at']?.id).toBe(angle.id);
    expect(countBlocks(plugged)).toBe(2);

    const { blocks, removed } = removeBlock(plugged, angle.id);
    expect(removed?.id).toBe(angle.id);
    expect(blocks[0]!.inputs['at']).toBeNull();
  });

  it('removes a statement together with whatever is plugged into it', () => {
    const aim = createBlock('aim-at');
    const plugged = setInput([aim], aim.id, 'at', createBlock('target'));
    const { blocks, removed } = removeBlock(plugged, aim.id);
    expect(blocks).toEqual([]);
    expect(removed?.inputs['at']).not.toBeNull();
  });

  it('updates a nested block by id', () => {
    const aim = createBlock('aim-at');
    const angle = createBlock('angle');
    const tree = setInput([aim], aim.id, 'at', angle);
    const next = updateBlock(tree, angle.id, (b) => ({ ...b, fields: { ...b.fields, degrees: 90 } }));
    expect(next[0]!.inputs['at']?.fields['degrees']).toBe(90);
    expect(tree[0]!.inputs['at']?.fields['degrees']).toBe(0);
  });
});
