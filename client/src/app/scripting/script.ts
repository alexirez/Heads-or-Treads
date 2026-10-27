import { BlockInstance, createBlock } from './blocks';
import { setInput } from './block-tree';

export interface Script {
  readonly id: string;
  readonly name: string;
  readonly blocks: readonly BlockInstance[];
}

/** A new script always begins with its "On game start" hat block. */
export function createScript(name: string): Script {
  return {
    id: Math.random().toString(36).slice(2, 10),
    name,
    blocks: [createBlock('on-game-start')],
  };
}

/** A small example so the library and editor have something to show on first load. */
export function createStarterScript(): Script {
  const aim = createBlock('aim-at');
  let blocks: readonly BlockInstance[] = [createBlock('on-game-start'), aim, createBlock('shoot')];
  blocks = setInput(blocks, aim.id, 'at', createBlock('target'));
  return { id: 'starter', name: 'Starter script', blocks };
}
