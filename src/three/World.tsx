import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import { useState } from 'react';
import Scene from './Scene';

// Root of the 3D experience. Wraps the canvas in a physics world and adds
// adaptive DPR + a performance monitor so the frame rate stays near 60 FPS by
// dialing back pixel density on weaker GPUs (Performance Efficiency pillar).
export default function World() {
  const [dpr, setDpr] = useState(1.5);

  return (
    <Canvas
      shadows={false}
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 9, 14], fov: 55 }}
      style={{ position: 'fixed', inset: 0, zIndex: 10 }}
    >
      <color attach="background" args={['#06060f']} />
      <fog attach="fog" args={['#06060f', 22, 46]} />

      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(1.5)}
      />
      <AdaptiveDpr pixelated />

      <Physics gravity={[0, -9.81, 0]} defaultContactMaterial={{ restitution: 0.1 }}>
        <Scene />
      </Physics>
    </Canvas>
  );
}
