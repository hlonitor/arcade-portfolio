import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves project sites from /<repo-name>/.
// Set VITE_BASE at build time (the deploy workflow does this automatically).
// Falls back to '/' for local dev and user/organization pages.
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: 'es2020',
    // Split the heavy 3D libraries into their own chunk so the initial
    // HTML/HUD paints fast and Three.js streams in behind the "Press Start" gate.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei', '@react-three/cannon'],
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
});
