import { normalizeNote } from './notes.js';

export function parseDSL(text) {
  const result = {
    tempo: 80,
    swing: 0.5,
    fx: {},
    instruments: {},
    samples: {},
    kit: {},
    drums: {},
    bass: null,
    lead: null,
    chords: null,
    errors: [],
  };

  const lines = text.split('\n');
  let pendingLoop = 1;
  let lastTrack = null;
  for (let i = 0; i < lines.length; i++) {
    const original = lines[i];
    const ci = original.indexOf('//');
    const raw = ci !== -1 ? original.slice(0, ci) : original;
    const commentPart = ci !== -1 ? original.slice(ci) : '';
    const isIndented = /^\s+\S/.test(raw);
    const line = raw.trim();
    if (!line) {
      if (/^\/\/\s*[a-z]+\s*:/i.test(commentPart)) lastTrack = null;
      continue;
    }

    try {
      if (line.startsWith('@')) {
        parseDirective(line, result);
      } else if (isIndented && !line.includes(':') && lastTrack) {
        appendTrack(lastTrack, line, result);
      } else if (line.includes(':')) {
        const idx = line.indexOf(':');
        const head = line.slice(0, idx).trim().toLowerCase();
        if (head === 'loop') {
          const n = parseInt(line.slice(idx + 1).trim(), 10);
          if (!isNaN(n) && n > 0) pendingLoop = n;
        } else {
          parseTrack(line, result, pendingLoop);
          pendingLoop = 1;
          lastTrack = head;
        }
      }
    } catch (e) {
      result.errors.push(`line ${i + 1}: ${e.message}`);
    }
  }
  return result;
}

function tokenizeDirective(s) {
  const tokens = [];
  const re = /"([^"]*)"|(\S+)/g;
  let m;
  while ((m = re.exec(s)) !== null) tokens.push(m[1] !== undefined ? m[1] : m[2]);
  return tokens;
}

function parseDirective(line, r) {
  const parts = tokenizeDirective(line.slice(1));
  const cmd = parts[0];
  if (cmd === 'tempo') {
    const v = parseFloat(parts[1]);
    if (!isNaN(v)) r.tempo = Math.max(40, Math.min(200, v));
  } else if (cmd === 'swing') {
    const v = parseFloat(parts[1]);
    if (!isNaN(v)) r.swing = Math.max(0.5, Math.min(0.85, v));
  } else if (cmd === 'fx') {
    const name = parts[1];
    const val = parseFloat(parts[2]);
    if (name && !isNaN(val)) r.fx[name] = Math.max(0, Math.min(1, val));
  } else if (cmd === 'sample') {
    const name = parts[1];
    const file = parts[2];
    if (name && file) r.samples[name] = file;
  } else if (cmd === 'instrument') {
    const track = parts[1];
    const type = parts[2];
    const intensity = parts[3] !== undefined ? Math.max(0, Math.min(1, parseFloat(parts[3]))) : 1.0;
    if (track && type) r.instruments[track] = { type, intensity: isNaN(intensity) ? 1.0 : intensity };
  } else if (cmd === 'kit') {
    const role = parts[1];
    const name = parts[2];
    if (role && name) {
      r.kit = r.kit || {};
      r.kit[role] = name;
    }
  }
}

function parseTrack(line, r, loop = 1) {
  const idx = line.indexOf(':');
  const name = line.slice(0, idx).trim().toLowerCase();
  const body = line.slice(idx + 1).trim();
  if (!body) return;
  writeTrack(name, body, r, loop);
}

function appendTrack(name, body, r) {
  writeTrack(name, body, r, 1);
}

function writeTrack(name, body, r, loop) {
  const drumNames = ['kick', 'snare', 'hat', 'hihat', 'perc', 'clap', 'vocal'];
  if (drumNames.includes(name)) {
    const norm = name === 'hihat' ? 'hat' : name;
    const steps = repeat(parseSteps(body), loop);
    r.drums[norm] = r.drums[norm] ? r.drums[norm].concat(steps) : steps;
  } else if (name === 'bass' || name === 'lead') {
    const notes = repeat(parseNotes(body), loop);
    r[name] = r[name] ? { notes: r[name].notes.concat(notes) } : { notes };
  } else if (name === 'chords' || name === 'pad') {
    const chords = repeat(parseChords(body), loop);
    r.chords = r.chords ? { chords: r.chords.chords.concat(chords) } : { chords };
  }
}

function repeat(arr, n) {
  if (n <= 1) return arr;
  const out = [];
  for (let i = 0; i < n; i++) out.push(...arr);
  return out;
}

function parseSteps(body) {
  const cleaned = body.replace(/\s+/g, '');
  const steps = [];
  for (const c of cleaned) {
    if (c === 'x' || c === 'X') steps.push(true);
    else if (c === '.' || c === '-' || c === '_') steps.push(false);
  }
  while (steps.length < 16) steps.push(false);
  return steps;
}

function parseNotes(body) {
  const tokens = body.replace(/[\[\]]/g, ' ').trim().split(/\s+/);
  const notes = [];
  for (const t of tokens) {
    if (t === '.' || t === '-' || t === '_' || t === '') {
      notes.push(null);
    } else if (/^[A-G][#b]?\d$/i.test(t)) {
      notes.push(normalizeNote(t));
    }
  }
  while (notes.length < 16) notes.push(null);
  return notes;
}

function parseChords(body) {
  const tokens = body.replace(/[<>]/g, ' ').trim().split(/\s+/);
  return tokens.filter(t => t.length > 0);
}

export function trackCount(p) {
  return Object.keys(p.drums).length + (p.bass ? 1 : 0) + (p.lead ? 1 : 0) + (p.chords ? 1 : 0);
}

export function isPlayable(p) {
  return Object.keys(p.drums).length + (p.bass ? 1 : 0) + (p.lead ? 1 : 0) + (p.chords ? 1 : 0) > 0;
}
