import { useRef, useState } from 'react';
import { setJoystick } from '../three/sharedInput';

// On-screen virtual joystick for touch devices. Writes into the shared input
// module that the 3D Player polls each frame. Only rendered on coarse-pointer
// (touch) devices — see the media query in App.
export default function Joystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef(false);
  const RADIUS = 46;

  const update = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > RADIUS) {
      dx = (dx / dist) * RADIUS;
      dy = (dy / dist) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    // forward = up (negative screen-y); strafe = right (positive x)
    setJoystick(-dy / RADIUS, dx / RADIUS);
  };

  const end = () => {
    active.current = false;
    setKnob({ x: 0, y: 0 });
    setJoystick(0, 0);
  };

  return (
    <div
      ref={baseRef}
      style={styles.base}
      onTouchStart={(e) => {
        active.current = true;
        const t = e.touches[0];
        update(t.clientX, t.clientY);
      }}
      onTouchMove={(e) => {
        if (!active.current) return;
        const t = e.touches[0];
        update(t.clientX, t.clientY);
      }}
      onTouchEnd={end}
      onTouchCancel={end}
      aria-hidden="true"
    >
      <div style={{ ...styles.knob, transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    position: 'fixed',
    bottom: 90,
    left: 24,
    width: 110,
    height: 110,
    borderRadius: '50%',
    background: 'rgba(34,211,238,0.08)',
    border: '2px solid rgba(34,211,238,0.4)',
    zIndex: 45,
    touchAction: 'none',
    pointerEvents: 'auto',
    display: 'grid',
    placeItems: 'center',
  },
  knob: {
    width: 46,
    height: 46,
    borderRadius: '50%',
    background: 'rgba(34,211,238,0.5)',
    border: '2px solid #22d3ee',
    boxShadow: '0 0 12px rgba(34,211,238,0.6)',
  },
};
