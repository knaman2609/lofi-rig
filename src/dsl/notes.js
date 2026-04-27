export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const NOTE_TO_SEMI = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4,
  F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

export function noteToMidi(n) {
  const m = n.match(/^([A-G][#b]?)(\d+)$/);
  if (!m) return 60;
  const semi = NOTE_TO_SEMI[m[1]] ?? 0;
  return (parseInt(m[2]) + 1) * 12 + semi;
}

export function midiToNote(midi) {
  const oct = Math.floor(midi / 12) - 1;
  const semi = midi % 12;
  return NOTE_NAMES[semi] + oct;
}

export function normalizeNote(n) {
  return n[0].toUpperCase() + n.slice(1).replace('B', 'b');
}

export function chordToNotes(symbol) {
  const m = symbol.match(/^([A-G][#b]?)(.*)$/);
  if (!m) return ['C3', 'E3', 'G3'];
  const root = m[1];
  const quality = m[2].toLowerCase();
  const rootMidi = noteToMidi(root + '3');

  let intervals;
  if (quality === '' || quality === 'maj') intervals = [0, 4, 7];
  else if (quality === 'm' || quality === 'min') intervals = [0, 3, 7];
  else if (quality === '7') intervals = [0, 4, 7, 10];
  else if (quality === 'maj7') intervals = [0, 4, 7, 11];
  else if (quality === 'm7' || quality === 'min7') intervals = [0, 3, 7, 10];
  else if (quality === 'dim') intervals = [0, 3, 6];
  else if (quality === 'sus4') intervals = [0, 5, 7];
  else if (quality === 'sus2') intervals = [0, 2, 7];
  else if (quality === '9') intervals = [0, 4, 7, 10, 14];
  else if (quality === 'm9') intervals = [0, 3, 7, 10, 14];
  else intervals = [0, 4, 7];

  return intervals.map(i => midiToNote(rootMidi + i));
}
