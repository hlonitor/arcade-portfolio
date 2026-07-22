import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Text, Float } from '@react-three/drei';
import type { Group, Mesh } from 'three';
import { useProximity } from './proximity';
import { useGame } from '../store';
import { audio } from '../audio/AudioEngine';

// A distinct "NPC contact terminal" kiosk — pink, taller, with a screen face.
export default function ContactKiosk({ position }: { position: [number, number, number] }) {
  const [x, , z] = position;
  const near = useProximity((s) => s.nearId === 'contact');
  const openPanel = useGame((s) => s.openPanel);
  const audioOn = useGame((s) => s.audioOn);
  const markerRef = useRef<Group>(null);

  const [bodyRef] = useBox<Mesh>(() => ({
    type: 'Static',
    position: [x, 1.2, z],
    args: [1.8, 2.4, 1],
  }));

  useFrame((state) => {
    if (markerRef.current) {
      markerRef.current.rotation.y += 0.012;
      markerRef.current.position.y = 3.6 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  const color = '#f472b6';

  return (
    <group>
      <mesh ref={bodyRef} visible={false}>
        <boxGeometry args={[1.8, 2.4, 1]} />
      </mesh>

      {/* Terminal cabinet */}
      <mesh
        position={[x, 1.2, z]}
        onPointerOver={() => audioOn && audio.sfx('hover')}
        onClick={() => {
          audio.sfx('click');
          openPanel('contact');
        }}
      >
        <boxGeometry args={[1.8, 2.4, 1]} />
        <meshStandardMaterial
          color="#1a1030"
          emissive={color}
          emissiveIntensity={near ? 0.8 : 0.3}
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      {/* Glowing screen face */}
      <mesh position={[x, 1.5, z + 0.52]}>
        <planeGeometry args={[1.3, 0.9]} />
        <meshBasicMaterial color={color} transparent opacity={near ? 0.9 : 0.55} />
      </mesh>
      <Text position={[x, 1.5, z + 0.53]} fontSize={0.22} color="#06060f" anchorX="center">
        {'>_ CONTACT'}
      </Text>

      {/* Base ring */}
      <mesh position={[x, 0.05, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={near ? 0.8 : 0.3} />
      </mesh>

      {/* Floating marker */}
      <Float speed={2} floatIntensity={0.6} rotationIntensity={0}>
        <group ref={markerRef} position={[x, 3.6, z]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={near ? 2 : 1} />
          </mesh>
          <Text
            position={[0, 0.8, 0]}
            fontSize={0.34}
            color="#e6f1ff"
            anchorX="center"
            outlineWidth={0.02}
            outlineColor="#06060f"
          >
            Contact Terminal
          </Text>
        </group>
      </Float>
    </group>
  );
}
