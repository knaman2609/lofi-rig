export function Header({ status, view, onHome }) {
  return (
    <header>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {view === 'editor' && (
          <button className="home-btn" onClick={onHome} title="Back to library">
            ← library
          </button>
        )}
        <div className="title">lofi.rig</div>
      </div>
      <div className="meta">v0 · <span>{status}</span></div>
    </header>
  );
}
