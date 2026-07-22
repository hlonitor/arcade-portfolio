import { create } from 'zustand';

// Tracks the player's live world position and which kiosk (if any) they're
// standing on. Kiosks subscribe to `nearId` to glow; the player writes position
// each frame. Kept separate from the main game store to avoid re-rendering the
// whole app on every physics tick — only components that select these fields
// re-render, and we update at most a few times per second in practice.
type ProximityState = {
  playerPos: [number, number, number];
  nearId: string | null;
  setPlayerPos: (p: [number, number, number]) => void;
  setNear: (id: string | null) => void;
};

export const useProximity = create<ProximityState>((set) => ({
  playerPos: [0, 1, 0],
  nearId: null,
  setPlayerPos: (p) => set({ playerPos: p }),
  setNear: (id) => set((s) => (s.nearId === id ? s : { nearId: id })),
}));
