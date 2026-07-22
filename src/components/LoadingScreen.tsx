export default function LoadingScreen() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: '#06060f',
        zIndex: 50,
      }}
    >
      <p className="mono neon-text" style={{ animation: 'blink 0.5s infinite' }}>
        RENDERING 3D HUB…
      </p>
    </div>
  );
}
