export function Footer({
  status,
  isError,
  isPlaying,
  isLoading,
  canReload,
  canPlay,
  onLoad,
  onReload,
  onPlay,
  onStop,
}) {
  return (
    <footer>
      <button onClick={onLoad}>load</button>
      <button onClick={onReload} disabled={!canReload}>reload</button>
      <div className="spacer" />
      <span className={'status' + (isError ? ' error' : '')}>{status}</span>
      <div className={'indicator' + (isPlaying ? ' playing' : '')} />
      <button className="primary" onClick={onPlay} disabled={!canPlay || isLoading || isPlaying}>
        {isLoading ? 'loading...' : 'play'}
      </button>
      <button onClick={onStop} disabled={!isPlaying}>stop</button>
    </footer>
  );
}
