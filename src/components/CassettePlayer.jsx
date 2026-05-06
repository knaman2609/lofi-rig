export function CassettePlayer({ isPlaying, bpm = 80 }) {
  // Calculate animation duration based on BPM
  // One full rotation per 4 beats (one bar in 4/4 time)
  const secondsPerBeat = 60 / bpm;
  const rotationDuration = (secondsPerBeat * 4).toFixed(2);
  const reel1Duration = (rotationDuration * 0.95).toFixed(2); // Left reel slightly faster
  const reel2Duration = (rotationDuration * 1.05).toFixed(2); // Right reel slightly slower

  const reelStyle1 = {
    animation: isPlaying ? `spin-reel ${reel1Duration}s linear infinite` : 'none'
  };

  const reelStyle2 = {
    animation: isPlaying ? `spin-reel ${reel2Duration}s linear infinite` : 'none'
  };

  return (
    <div className={`cassette-player${isPlaying ? ' playing' : ''}`}>
      <div className="cassette-body">
        {/* Left Reel */}
        <div className="reel-container left">
          <div className="reel" style={reelStyle1} />
        </div>

        {/* Tape Area */}
        <div className="tape-area">
          <div className="tape-label">
            <div className="label-text">TAPE</div>
          </div>
        </div>

        {/* Right Reel */}
        <div className="reel-container right">
          <div className="reel" style={reelStyle2} />
        </div>

        {/* Screws */}
        <div className="screw top-left" />
        <div className="screw top-right" />
        <div className="screw bottom-left" />
        <div className="screw bottom-right" />
      </div>
    </div>
  );
}
