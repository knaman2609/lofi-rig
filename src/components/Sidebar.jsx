import { trackCount } from '../dsl/parser.js';

function FileInfo({ file }) {
  if (!file) {
    return <div className="file-info empty">none loaded</div>;
  }
  return (
    <div className="file-info">
      <div>{file.name}</div>
      <div className="path">{file.size} bytes · {file.note}</div>
    </div>
  );
}

function Stats({ pattern }) {
  const tracks = trackCount(pattern);
  const bars = pattern.chords ? pattern.chords.chords.length : 1;
  return (
    <div className="stats">
      <div className="stat">tempo<span>{pattern.tempo} bpm</span></div>
      <div className="stat">swing<span>{pattern.swing.toFixed(2)}</span></div>
      <div className="stat">tracks<span>{tracks}</span></div>
      <div className="stat">bars<span>{bars}</span></div>
    </div>
  );
}

function DslHelp() {
  return (
    <div className="help">
      <p><strong>directives</strong></p>
      <p><code>@tempo 78</code> · bpm</p>
      <p><code>@swing 0.6</code> · 0.5 = straight</p>
      <p style={{ marginTop: 10 }}><strong>tracks</strong></p>
      <p><code>kick: x..x..x.</code></p>
      <p><code>bass: A2 . E2 G2</code></p>
      <p><code>chords: Am7 Dm7 G7</code></p>
      <p style={{ marginTop: 10 }}><strong>fx</strong></p>
      <p><code>@fx vinyl 0.3</code></p>
      <p><code>@fx reverb 0.4</code></p>
    </div>
  );
}

export function Sidebar({ file, pattern }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>file</h3>
        <FileInfo file={file} />
      </div>
      <div className="sidebar-section">
        <h3>pattern</h3>
        <Stats pattern={pattern} />
      </div>
      <div className="sidebar-section">
        <h3>dsl reference</h3>
        <DslHelp />
      </div>
    </aside>
  );
}
