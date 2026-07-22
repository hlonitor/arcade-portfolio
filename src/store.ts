import { create } from 'zustand';

export type GameMode =
  | 'boot' // "Press Start" overlay
  | 'playing' // 3D world active
  | 'accessible'; // 2D / WCAG fallback view

export type PanelId = string | null;

type GameState = {
  mode: GameMode;
  audioOn: boolean;
  cookieChoice: 'unset' | 'accepted' | 'declined';
  activePanel: PanelId; // which project/section overlay is open
  visitedLevels: Set<string>;
  achievements: string[]; // achievement labels, in unlock order
  hudVisible: boolean;

  start: () => void;
  enterAccessible: () => void;
  exitAccessible: () => void;
  toggleAudio: () => void;
  setCookieChoice: (c: 'accepted' | 'declined') => void;
  openPanel: (id: string) => void;
  closePanel: () => void;
  visitLevel: (id: string) => void;
  unlock: (label: string) => void;
  toggleHud: () => void;
};

export const useGame = create<GameState>((set, get) => ({
  mode: 'boot',
  audioOn: false,
  cookieChoice: 'unset',
  activePanel: null,
  visitedLevels: new Set<string>(),
  achievements: [],
  hudVisible: true,

  start: () => set({ mode: 'playing' }),
  enterAccessible: () => set({ mode: 'accessible', activePanel: null }),
  exitAccessible: () => set({ mode: 'playing' }),
  toggleAudio: () => set((s) => ({ audioOn: !s.audioOn })),
  setCookieChoice: (c) => set({ cookieChoice: c }),
  openPanel: (id) => {
    get().visitLevel(id);
    set({ activePanel: id });
  },
  closePanel: () => set({ activePanel: null }),
  visitLevel: (id) => {
    const { visitedLevels } = get();
    if (visitedLevels.has(id)) return;
    const next = new Set(visitedLevels);
    next.add(id);
    set({ visitedLevels: next });
    // Fire the "Explorer" achievement once the first three levels are seen.
    if (next.size === 3) get().unlock('Explorer — visited 3 levels');
  },
  unlock: (label) =>
    set((s) =>
      s.achievements.includes(label)
        ? s
        : { achievements: [...s.achievements, label] },
    ),
  toggleHud: () => set((s) => ({ hudVisible: !s.hudVisible })),
}));
