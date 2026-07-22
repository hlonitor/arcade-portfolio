import type { Mesh } from 'three';
import { usePlane } from '@react-three/cannon';
import { Grid, Stars } from '@react-three/drei';
import Player from './Player';
import Kiosk from './Kiosk';
import ContactKiosk from './ContactKiosk';
import GridFloorGlow from './GridFloorGlow';
import { PROJECTS } from '../data/content';

// The 3D showroom: a neon grid floor (physics plane), starfield, ambient +
// point lighting, one interactive kiosk per project, a contact kiosk, and the
// keyboard/pointer-driven player drone.
export default function Scene() {
  // Static physics ground so the player capsule has something to rest on.
  const [floorRef] = usePlane<Mesh>(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: 'Static',
  }));

  return (
    <>
      {/* Lighting — cheap: one hemisphere + two point lights, no shadow maps */}
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#22d3ee', '#1a1040', 0.5]} />
      <pointLight position={[0, 12, 0]} intensity={80} color="#a78bfa" distance={40} />
      <pointLight position={[-10, 6, -6]} intensity={40} color="#22d3ee" distance={30} />
      <pointLight position={[10, 6, 6]} intensity={40} color="#f472b6" distance={30} />

      <Stars radius={80} depth={40} count={1200} factor={3} fade speed={0.5} />

      {/* Visual floor + physics plane */}
      <mesh ref={floorRef} receiveShadow={false}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#0a0c1e" metalness={0.6} roughness={0.4} />
      </mesh>
      <Grid
        position={[0, 0.02, 0]}
        args={[120, 120]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#1b2b4a"
        sectionSize={5}
        sectionThickness={1.2}
        sectionColor="#22d3ee"
        fadeDistance={44}
        fadeStrength={1.5}
        infiniteGrid
      />
      <GridFloorGlow />

      {/* Project kiosks */}
      {PROJECTS.map((p) => (
        <Kiosk key={p.id} project={p} />
      ))}

      {/* Contact terminal kiosk */}
      <ContactKiosk position={[0, 0, 12]} />

      {/* The controllable avatar / camera drone */}
      <Player />
    </>
  );
}
