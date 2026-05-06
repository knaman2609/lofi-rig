import { useState } from 'react';
import { CassettePlayer } from './components/CassettePlayer.jsx';

export function HomeScreen({ tracks, onPickFolder, onSelect, onPlay, onStop, playingId, isPlaying }) {
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const currentTrack = selectedTrackId ? tracks.find(t => t.id === selectedTrackId) : tracks.find(t => t.id === playingId);
  const displayTrackId = selectedTrackId || playingId;

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
    <div className="home-screen home-player">
      <div className="home-header">
        <span className="home-title">lofi.player</span>
      </div>

      <div className="cassette-display">
        <CassettePlayer isPlaying={isPlaying} bpm={currentTrack?.tempo || 80} />
      </div>

      <div className="track-selector">
        <select
          className="track-dropdown"
          value={displayTrackId || ''}
          onChange={(e) => {
            setSelectedTrackId(e.target.value);
          }}
        >
          <option value="">— select a track —</option>
          {tracks.map(track => (
            <option key={track.id} value={track.id}>
              {track.name} {track.tags.length > 0 ? `· ${track.tags.join(' ')}` : ''}
            </option>
          ))}
        </select>

        <div className="player-controls">
          <button
            className="control-btn play-btn"
            onClick={() => currentTrack && onPlay(currentTrack)}
            disabled={!currentTrack || isPlaying}
          >
            ▶
          </button>
          <button
            className="control-btn stop-btn"
            onClick={onStop}
            disabled={!isPlaying}
          >
            ■
          </button>
        </div>
      </div>

      <button
        className="pick-folder-alt-btn"
        onClick={() => currentTrack && onSelect(currentTrack)}
        disabled={!currentTrack}
      >
        edit
      </button>
    </div>
  );
}
