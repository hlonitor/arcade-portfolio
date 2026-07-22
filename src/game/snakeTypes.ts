// Types for the grid-based Snake engine (v3).

export type Cell = { x: number; y: number };

export type FoodKind = 'packet' | 'project' | 'meme' | 'wisdom';

export type Food = {
  cell: Cell;
  kind: FoodKind;
  // project id (kind==='project'), or the meme/quote text to show.
  id?: string;
  text?: string;
  color: string;
};

export type Dir = 'up' | 'down' | 'left' | 'right';
