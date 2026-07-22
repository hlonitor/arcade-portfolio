// Shared types for the 2D platformer engine.

export type Rect = { x: number; y: number; w: number; h: number };

export type Platform = Rect & {
  kind: 'ground' | 'brick' | 'block';
};

// A "? " block that pays out an inspirational quote when headbutted.
export type QuestionBlock = Rect & {
  hit: boolean;
  quote: string;
};

// A booby-trap that pops a coding meme when touched (no real damage — the
// player just gets bounced and giggles).
export type Trap = Rect & {
  triggered: boolean;
  meme: string;
  kind: 'spike' | 'goomba' | 'pipe-mouth';
  // goombas patrol; store velocity + patrol bounds
  vx?: number;
  minX?: number;
  maxX?: number;
};

export type Coin = Rect & { taken: boolean };

export type Flag = Rect;

export type Decoration = Rect & {
  kind: 'cloud' | 'hill' | 'bush' | 'pipe' | 'crystal' | 'stalactite';
};

export type LevelMap = {
  width: number; // world width in px
  height: number; // world height in px (fixed viewport height)
  groundY: number; // y of the top of the ground
  platforms: Platform[];
  questionBlocks: QuestionBlock[];
  traps: Trap[];
  coins: Coin[];
  decorations: Decoration[];
  flag: Flag;
  spawn: { x: number; y: number };
};
