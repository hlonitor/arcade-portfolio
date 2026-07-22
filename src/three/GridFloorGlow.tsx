import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

// A slowly pulsing translucent disc under the whole scene, giving the neon grid
// floor a soft "energy field" glow without the cost of post-processing bloom.
export default function GridFloorGlow() {
  const ref = useRef<Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const s = 1 + Math.sin(t * 0.6) * 0.03;
    ref.current.scale.set(s, s, s);
  });

  return (
    <mesh ref={ref} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[26, 48]} />
      <meshBasicMaterial color="#12203f" transparent opacity={0.5} />
    </mesh>
  );
}
