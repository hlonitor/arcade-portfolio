import { create } from 'zustand';

export type GameMode =
  | 'boot' // "Press Start" overlay
  | 'playing' // snake arena active
  | 'accessible'; // 2D / WCAG accessible document view

export type PanelId = string | null;

type GameState = {
  mode: GameMode;
  audioOn: boolean;
  cookieChoice: 'unset' | 'accepted' | 'declined';
  activePanel: PanelId; // 'contact' or a level id
  collected: Set<string>; // project nodes eaten
  coins: number; // pellets + wisdom eaten
  achievements: string[];
  hudVisible: boolean;

  start: () => void;
  enterAccessible: () => void;
  exitAccessible: () => void;
  toggleAudio: () => void;
  setCookieChoice: (c: 'accepted' | 'declined') => void;
  openPanel: (id: string) => void;
  closePanel: () => void;
  collectProject: (id: string) => void;
  addCoin: () => void;
  unlock: (label: string) => void;
  toggleHud: () => void;
};

export const useGame = create<GameState>((set, get) => ({
  mode: 'boot',
  audioOn: false,
  cookieChoice: 'unset',
  activePanel: null,
  collected: new Set<string>(),
  coins: 0,
  achievements: [],
  hudVisible: true,

  start: () => set({ mode: 'playing' }),
  enterAccessible: () => set({ mode: 'accessible', activePanel: null }),
  exitAccessible: () => set({ mode: 'playing' }),
  toggleAudio: () => set((s) => ({ audioOn: !s.audioOn })),
  setCookieChoice: (c) => set({ cookieChoice: c }),
  openPanel: (id) => set({ activePanel: id }),
  closePanel: () => set({ activePanel: null }),
  collectProject: (id) => {
    const { collected } = get();
    if (!collected.has(id)) {
      const next = new Set(collected);
      next.add(id);
      set({ collected: next });
      get().unlock('Data Recovered — collected a project');
      if (next.size >= 2) get().unlock('Full Stack — collected 2 projects');
    }
    set({ activePanel: id }); // open the case study
  },
  addCoin: () => {
    set((s) => ({ coins: s.coins + 1 }));
    if (get().coins === 10) get().unlock('Packet Hoarder — 10 data packets');
  },
  unlock: (label) =>
    set((s) =>
      s.achievements.includes(label)
        ? s
        : { achievements: [...s.achievements, label] },
    ),
  toggleHud: () => set((s) => ({ hudVisible: !s.hudVisible })),
}));
