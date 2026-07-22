// Module-level movement input shared between the DOM HUD (virtual joystick)
// and the in-Canvas Player. Kept outside React state on purpose: it's polled
// every animation frame and must never cause re-renders.
export const joystick = { forward: 0, strafe: 0 };

export function setJoystick(forward: number, strafe: number) {
  joystick.forward = forward;
  joystick.strafe = strafe;
}
