import { BlockInstance } from '../blocks/blocks';

// Pure helpers that return new arrays/objects instead of mutating, so signals notice changes.

export function insertAt(
  blocks: readonly BlockInstance[],
  index: number,
  block: BlockInstance,
): BlockInstance[] {
  const at = Math.min(Math.max(index, 0), blocks.length);
  return [...blocks.slice(0, at), block, ...blocks.slice(at)];
}

/** Removes a block (and everything plugged into it) from anywhere in the tree. */
export function removeBlock(
  blocks: readonly BlockInstance[],
  id: string,
): { blocks: BlockInstance[]; removed: BlockInstance | undefined } {
  let removed: BlockInstance | undefined;

  const walk = (list: readonly BlockInstance[]): BlockInstance[] => {
    const out: BlockInstance[] = [];
    for (const block of list) {
      if (block.id === id) {
        removed = block;
        continue;
      }
      const inputs: Record<string, BlockInstance | null> = {};
      for (const [slot, child] of Object.entries(block.inputs)) {
        inputs[slot] = child ? (walk([child])[0] ?? null) : null;
      }
      out.push({ ...block, inputs });
    }
    return out;
  };

  const result = walk(blocks);
  return { blocks: result, removed };
}

/** Applies `change` to the block with this id, wherever it is in the tree. */
export function updateBlock(
  blocks: readonly BlockInstance[],
  id: string,
  change: (block: BlockInstance) => BlockInstance,
): BlockInstance[] {
  return blocks.map((block) => {
    const next = block.id === id ? change(block) : block;
    const inputs: Record<string, BlockInstance | null> = {};
    for (const [slot, child] of Object.entries(next.inputs)) {
      inputs[slot] = child ? updateBlock([child], id, change)[0]! : null;
    }
    return { ...next, inputs };
  });
}

export function setInput(
  blocks: readonly BlockInstance[],
  parentId: string,
  slot: string,
  child: BlockInstance | null,
): BlockInstance[] {
  return updateBlock(blocks, parentId, (parent) => ({
    ...parent,
    inputs: { ...parent.inputs, [slot]: child },
  }));
}

export function countBlocks(blocks: readonly BlockInstance[]): number {
  return blocks.reduce(
    (total, block) =>
      total +
      1 +
      Object.values(block.inputs).reduce(
        (sum, child) => sum + (child ? countBlocks([child]) : 0),
        0,
      ),
    0,
  );
}