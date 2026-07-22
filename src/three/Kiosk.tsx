import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Text, Float } from '@react-three/drei';
import type { Group, Mesh, MeshStandardMaterial } from 'three';
import type { Project } from '../data/content';
import { useProximity } from './proximity';
import { useGame } from '../store';
import { audio } from '../audio/AudioEngine';

// One interactive "level" kiosk in the showroom. A low-poly pillar with a
// floating quest marker; it brightens when the player is near and is clickable
// as a fallback for mouse/touch users.
export default function Kiosk({ project }: { project: Project }) {
  const [x, z] = project.worldPos;
  const near = useProximity((s) => s.nearId === project.id);
  const openPanel = useGame((s) => s.openPanel);
  const audioOn = useGame((s) => s.audioOn);
  const locked = project.status === 'locked';

  const markerRef = useRef<Group>(null);
  const pillarRef = useRef<Mesh>(null);

  // A solid physics body so the player collides with the pillar.
  const [bodyRef] = useBox<Mesh>(() => ({
    type: 'Static',
    position: [x, 1, z],
    args: [1.6, 2, 1.6],
  }));

  useFrame((state) => {
    if (markerRef.current) {
      markerRef.current.rotation.y += 0.01;
      markerRef.current.position.y =
        3.2 + Math.sin(state.clock.elapsedTime * 2 + x) * 0.15;
    }
    if (pillarRef.current) {
      const mat = pillarRef.current.material as MeshStandardMaterial;
      const target = near ? 1.6 : 0.5;
      mat.emissiveIntensity += (target - mat.emissiveIntensity) * 0.1;
    }
  });

  const color = locked ? '#64748b' : project.color;

  return (
    <group>
      {/* Physics collider (invisible) */}
      <mesh ref={bodyRef} visible={false}>
        <boxGeometry args={[1.6, 2, 1.6]} />
      </mesh>

      {/* Visible pillar */}
      <mesh
        ref={pillarRef}
        position={[x, 1, z]}
        onPointerOver={() => audioOn && audio.sfx('hover')}
        onClick={() => {
          audio.sfx('click');
          openPanel(project.id);
        }}
      >
        <boxGeometry args={[1.6, 2, 1.6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.5}
          roughness={0.35}
        />
      </mesh>

      {/* Base glow ring */}
      <mesh position={[x, 0.05, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 1.9, 32]} />
        <meshBasicMaterial color={color} transparent opacity={near ? 0.8 : 0.35} />
      </mesh>

      {/* Level number on the pillar face */}
      <Text
        position={[x, 1.2, z + 0.82]}
        fontSize={0.6}
        color="#06060f"
        anchorX="center"
        anchorY="middle"
      >
        {locked ? '🔒' : `L${project.level}`}
      </Text>

      {/* Floating quest marker + title */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.6}>
        <group ref={markerRef} position={[x, 3.2, z]}>
          {/* Diamond quest marker */}
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={near ? 2 : 1}
            />
          </mesh>
          <Text
            position={[0, 0.8, 0]}
            fontSize={0.34}
            color={locked ? '#94a3b8' : '#e6f1ff'}
            anchorX="center"
            anchorY="middle"
            maxWidth={5}
            textAlign="center"
            outlineWidth={0.02}
            outlineColor="#06060f"
          >
            {locked ? 'LOCKED' : project.title}
          </Text>
        </group>
      </Float>
    </group>
  );
}
