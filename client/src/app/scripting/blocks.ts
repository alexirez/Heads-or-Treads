// Plain TypeScript: no Angular imports, so the game can reuse it later.

export type BlockType = 'on-game-start' | 'aim-at' | 'shoot' | 'angle' | 'target' | 'current';

/** hat = starts a script, statement = does something, value = plugs into a slot */
export type BlockKind = 'hat' | 'statement' | 'value';

export interface BlockDef {
  readonly type: BlockType;
  readonly kind: BlockKind;
  readonly label: string;
  /** Names of the slots this block has. Only value blocks can be dropped into them. */
  readonly slots: readonly string[];
  readonly defaults: Readonly<Record<string, string | number>>;
}

export interface BlockInstance {
  readonly id: string;
  readonly type: BlockType;
  readonly fields: Readonly<Record<string, string | number>>;
  readonly inputs: Readonly<Record<string, BlockInstance | null>>;
}

/** What the drag-and-drop code can be carrying: a palette entry or a block already in a script. */
export type DragData = BlockDef | BlockInstance;

export interface Option {
  readonly value: string;
  readonly label: string;
}

export const TARGET_OPTIONS: readonly Option[] = [
  { value: 'enemy-leader', label: 'Enemy leader' },
  { value: 'nearest-enemy', label: 'Nearest enemy' },
  { value: 'weakest-enemy', label: 'Weakest enemy' },
];

export const CURRENT_OPTIONS: readonly Option[] = [
  { value: 'heading', label: 'Heading' },
  { value: 'turret-angle', label: 'Turret angle' },
  { value: 'x', label: 'Position X' },
  { value: 'z', label: 'Position Z' },
  { value: 'health', label: 'Health' },
  { value: 'ammo', label: 'Ammo' },
];

export const BLOCK_DEFS: Readonly<Record<BlockType, BlockDef>> = {
  'on-game-start': {
    type: 'on-game-start',
    kind: 'hat',
    label: 'On game start',
    slots: [],
    defaults: {},
  },
  'aim-at': {
    type: 'aim-at',
    kind: 'statement',
    label: 'Aim at',
    slots: ['at'],
    defaults: {},
  },
  shoot: { type: 'shoot', kind: 'statement', label: 'Shoot', slots: [], defaults: {} },
  angle: {
    type: 'angle',
    kind: 'value',
    label: 'Angle',
    slots: [],
    defaults: { degrees: 0 },
  },
  target: {
    type: 'target',
    kind: 'value',
    label: 'Target',
    slots: [],
    defaults: { which: 'enemy-leader' },
  },
  current: {
    type: 'current',
    kind: 'value',
    label: 'Current',
    slots: [],
    defaults: { value: 'heading' },
  },
};

export const PALETTE_SECTIONS: readonly { title: string; types: readonly BlockType[] }[] = [
  { title: 'Events', types: ['on-game-start'] },
  { title: 'Actions', types: ['aim-at', 'shoot'] },
  { title: 'Values', types: ['angle', 'target', 'current'] },
];

export function kindOf(item: { readonly type: BlockType }): BlockKind {
  return BLOCK_DEFS[item.type].kind;
}

export function isInstance(item: DragData): item is BlockInstance {
  return 'id' in item;
}

// Editor-only ids (not part of the game simulation), so Math.random is fine here.
function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function createBlock(type: BlockType): BlockInstance {
  const def = BLOCK_DEFS[type];
  return {
    id: newId(),
    type,
    fields: { ...def.defaults },
    inputs: Object.fromEntries(def.slots.map((slot) => [slot, null])),
  };
}
