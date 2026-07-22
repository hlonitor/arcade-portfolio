import { create } from 'zustand';

export type GameMode =
  | 'boot' // "Press Start" overlay
  | 'worldmap' // Mario-style map: pick a world (cert) / level (project)
  | 'playing' // inside a platformer level
  | 'accessible'; // 2D / WCAG accessible document view

export type PanelId = string | null;

type GameState = {
  mode: GameMode;
  audioOn: boolean;
  cookieChoice: 'unset' | 'accepted' | 'declined';
  activeLevelId: string | null; // which platformer level is loaded
  activePanel: PanelId; // which detail overlay is open ('contact' or a level id)
  visitedLevels: Set<string>;
  completedLevels: Set<string>; // reached the flag
  coins: number; // ? -blocks headbutted
  achievements: string[];
  hudVisible: boolean;

  start: () => void;
  goToMap: () => void;
  enterAccessible: () => void;
  exitAccessible: () => void;
  playLevel: (id: string) => void;
  toggleAudio: () => void;
  setCookieChoice: (c: 'accepted' | 'declined') => void;
  openPanel: (id: string) => void;
  closePanel: () => void;
  completeLevel: (id: string) => void;
  addCoin: () => void;
  unlock: (label: string) => void;
  toggleHud: () => void;
};

export const useGame = create<GameState>((set, get) => ({
  mode: 'boot',
  audioOn: false,
  cookieChoice: 'unset',
  activeLevelId: null,
  activePanel: null,
  visitedLevels: new Set<string>(),
  completedLevels: new Set<string>(),
  coins: 0,
  achievements: [],
  hudVisible: true,

  start: () => set({ mode: 'worldmap' }),
  goToMap: () => set({ mode: 'worldmap', activeLevelId: null, activePanel: null }),
  enterAccessible: () => set({ mode: 'accessible', activePanel: null }),
  exitAccessible: () => set({ mode: 'worldmap' }),
  playLevel: (id) => {
    const { visitedLevels } = get();
    const next = new Set(visitedLevels);
    next.add(id);
    set({ mode: 'playing', activeLevelId: id, activePanel: null, visitedLevels: next });
  },
  toggleAudio: () => set((s) => ({ audioOn: !s.audioOn })),
  setCookieChoice: (c) => set({ cookieChoice: c }),
  openPanel: (id) => set({ activePanel: id }),
  closePanel: () => set({ activePanel: null }),
  completeLevel: (id) => {
    const { completedLevels } = get();
    if (!completedLevels.has(id)) {
      const next = new Set(completedLevels);
      next.add(id);
      set({ completedLevels: next });
      get().unlock('Level Clear — reached the flag');
      if (next.size >= 2) get().unlock('Speedrunner — cleared 2 levels');
    }
    // Show the level's case-study panel on completion.
    set({ activePanel: id });
  },
  addCoin: () => {
    set((s) => ({ coins: s.coins + 1 }));
    if (get().coins === 5) get().unlock('Coin Collector — 5 blocks of wisdom');
  },
  unlock: (label) =>
    set((s) =>
      s.achievements.includes(label)
        ? s
        : { achievements: [...s.achievements, label] },
    ),
  toggleHud: () => set((s) => ({ hudVisible: !s.hudVisible })),
}));
