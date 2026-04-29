import { TrackArtwork } from './TrackArtwork.jsx';

function TrackCard({ track, isPlaying, onPlay, onStop, onOpen }) {
  const handleArtClick = () => isPlaying ? onStop() : onPlay(track);

  return (
    <div className={`track-card${isPlaying ? ' is-playing' : ''}`}>
      <div className="track-art-wrap" onClick={handleArtClick}>
        <TrackArtwork id={track.id} />
        <div className="play-overlay">
          <div className="play-btn-circle">
            {isPlaying ? '■' : '▶'}
          </div>
        </div>
      </div>
      <div className="track-info">
        <div className="track-name-row">
          <span className="track-name">{track.name}</span>
          {isPlaying && <span className="now-playing-dot" />}
        </div>
        <div className="track-meta">
          <span className="track-tags">{track.tags.join(' · ')}</span>
          <button className="edit-btn" onClick={() => onOpen(track)}>open</button>
        </div>
      </div>
    </div>
  );
}

export function HomeScreen({ tracks, onPickFolder, onSelect, onPlay, onStop, playingId, isPlaying }) {
  if (tracks.length === 0) {
    return (
      <div className="home-screen">
        <div className="home-header">
          <span className="home-title">lofi.player</span>
          <span className="home-sub">pick your tracks folder to get started</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
          <button className="pick-folder-btn" onClick={onPickFolder}>pick folder</button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-screen">
      <div className="home-header">
        <span className="home-title">lofi.player</span>
        <span className="home-sub">{tracks.length} tracks — hover &amp; play</span>
      </div>
      <div className="tracks-grid">
        {tracks.map(track => (
          <TrackCard
            key={track.id}
            track={track}
            isPlaying={playingId === track.id && isPlaying}
            onPlay={onPlay}
            onStop={onStop}
            onOpen={onSelect}
          />
        ))}
    </div>
    </div>
  );
}
