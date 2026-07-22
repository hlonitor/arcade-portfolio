import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3 } from 'three';
import type { Mesh } from 'three';
import { useControls } from './useControls';
import { joystick } from './sharedInput';
import { useProximity } from './proximity';
import { PROJECTS } from '../data/content';
import { useGame } from '../store';
import { audio } from '../audio/AudioEngine';

const SPEED = 6;
const KIOSK_RADIUS = 2.4; // how close you must be to auto-open a level
const CONTACT_POS: [number, number] = [0, 12];

// The player avatar: a glowing physics sphere ("camera drone") driven by
// WASD/arrows or the virtual joystick. The camera smoothly chases it, and
// walking into a kiosk's radius opens that level.
export default function Player() {
  const { input } = useControls();
  const { camera } = useThree();
  const setPlayerPos = useProximity((s) => s.setPlayerPos);
  const setNear = useProximity((s) => s.setNear);
  const openPanel = useGame((s) => s.openPanel);
  const activePanel = useGame((s) => s.activePanel);
  const audioOn = useGame((s) => s.audioOn);

  const [ref, api] = useSphere<Mesh>(() => ({
    mass: 1,
    args: [0.6],
    position: [0, 1, 4],
    linearDamping: 0.9,
    fixedRotation: true,
  }));

  // Mirror the physics body position into refs we can read each frame.
  const pos = useRef<[number, number, number]>([0, 1, 4]);
  const vel = useRef<[number, number, number]>([0, 0, 0]);
  const lastNear = useRef<string | null>(null);
  const cooldown = useRef(0);

  useEffect(() => {
    const unsubP = api.position.subscribe((p) => (pos.current = p as [number, number, number]));
    const unsubV = api.velocity.subscribe((v) => (vel.current = v as [number, number, number]));
    return () => {
      unsubP();
      unsubV();
    };
  }, [api]);

  const camTarget = useRef(new Vector3());
  const camDesired = useRef(new Vector3());

  useFrame((_, delta) => {
    // Combine keyboard + joystick input.
    const forward = clamp(input.current.forward + joystick.forward);
    const strafe = clamp(input.current.strafe + joystick.strafe);

    // Apply velocity in the XZ plane (keep whatever vertical velocity physics set).
    api.velocity.set(strafe * SPEED, vel.current[1], -forward * SPEED);

    const [x, y, z] = pos.current;

    // Smooth chase camera — always looks slightly ahead of the drone.
    camDesired.current.set(x, y + 7.5, z + 11);
    camera.position.lerp(camDesired.current, 1 - Math.pow(0.001, delta));
    camTarget.current.lerp(new Vector3(x, y + 1, z - 2), 1 - Math.pow(0.001, delta));
    camera.lookAt(camTarget.current);

    // Report position for the HUD / minimap.
    setPlayerPos([x, y, z]);

    // Proximity check against every kiosk (cheap: a handful of items).
    if (cooldown.current > 0) cooldown.current -= delta;
    let near: string | null = null;
    let nearDist = Infinity;

    for (const p of PROJECTS) {
      const d = Math.hypot(x - p.worldPos[0], z - p.worldPos[1]);
      if (d < KIOSK_RADIUS && d < nearDist) {
        near = p.id;
        nearDist = d;
      }
    }
    const cd = Math.hypot(x - CONTACT_POS[0], z - CONTACT_POS[1]);
    if (cd < KIOSK_RADIUS && cd < nearDist) near = 'contact';

    if (near !== lastNear.current) {
      lastNear.current = near;
      setNear(near);
      if (near && audioOn) audio.sfx('hover');
    }

    // Auto-open the level when you arrive (with a cooldown + only if nothing open).
    if (near && !activePanel && cooldown.current <= 0) {
      cooldown.current = 1.5;
      audio.sfx('click');
      openPanel(near);
    }
  });

  return (
    <mesh ref={ref} castShadow={false}>
      <sphereGeometry args={[0.6, 24, 24]} />
      <meshStandardMaterial
        color="#22d3ee"
        emissive="#22d3ee"
        emissiveIntensity={1.4}
        metalness={0.3}
        roughness={0.2}
      />
      {/* small halo ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.05, 8, 32]} />
        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={1.2} />
      </mesh>
      <pointLight color="#22d3ee" intensity={6} distance={8} />
    </mesh>
  );
}

function clamp(n: number) {
  return Math.max(-1, Math.min(1, n));
}
