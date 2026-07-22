import { useEffect, useRef } from 'react';

export type MoveInput = {
  forward: number; // -1..1
  strafe: number; // -1..1
};

// Unified movement input: reads WASD / arrow keys AND an optional virtual
// joystick (mobile). Exposes a ref so the physics loop can poll it every frame
// without triggering React re-renders.
export function useControls() {
  const input = useRef<MoveInput>({ forward: 0, strafe: 0 });
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const map: Record<string, keyof typeof dirs | undefined> = {
      KeyW: 'up',
      ArrowUp: 'up',
      KeyS: 'down',
      ArrowDown: 'down',
      KeyA: 'left',
      ArrowLeft: 'left',
      KeyD: 'right',
      ArrowRight: 'right',
    };
    const dirs = { up: false, down: false, left: false, right: false };

    const recompute = () => {
      input.current.forward =
        (keys.current.up ? 1 : 0) - (keys.current.down ? 1 : 0);
      input.current.strafe =
        (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
    };

    const onDown = (e: KeyboardEvent) => {
      const dir = map[e.code];
      if (!dir) return;
      // Prevent the page from scrolling on arrow keys.
      if (e.code.startsWith('Arrow')) e.preventDefault();
      keys.current[dir] = true;
      recompute();
    };
    const onUp = (e: KeyboardEvent) => {
      const dir = map[e.code];
      if (!dir) return;
      keys.current[dir] = false;
      recompute();
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // Called by the on-screen joystick (mobile).
  const setJoystick = (forward: number, strafe: number) => {
    input.current.forward = forward;
    input.current.strafe = strafe;
  };

  return { input, setJoystick };
}
