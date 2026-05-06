const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const DRUM_NAMES = new Set(['kick', 'snare', 'hat', 'hihat', 'perc', 'clap']);
const NOTE_NAMES = new Set(['bass', 'lead']);
const CHORD_NAMES = new Set(['chords', 'pad']);

function highlightDrumBody(track, body, startStep = 0) {
  let out = '';
  let step = startStep;
  for (const c of body) {
    if (c === 'x' || c === 'X') {
      out += `<span class="tok-step-on" data-track="${track}" data-step="${step}">${c}</span>`;
      step++;
    } else if (c === '.' || c === '-' || c === '_') {
      out += `<span class="tok-step-off" data-track="${track}" data-step="${step}">${c}</span>`;
      step++;
    } else if (c === '[' || c === ']') {
      out += `<span class="tok-bracket">${c}</span>`;
    } else {
      out += esc(c);
    }
  }
  return { html: out, step };
}

function highlightNoteBody(track, body, startStep = 0) {
  const re = /(\s+|\[|\]|[^\s\[\]]+)/g;
  let out = '', step = startStep, m;
  while ((m = re.exec(body)) !== null) {
    const t = m[0];
    if (/^\s+$/.test(t)) { out += t; continue; }
    if (t === '[' || t === ']') { out += `<span class="tok-bracket">${t}</span>`; continue; }
    if (t === ':') { out += ':'; continue; }
    if (t === '.' || t === '-' || t === '_') {
      out += `<span class="tok-step-off" data-track="${track}" data-step="${step}">${t}</span>`;
      step++;
    } else if (/^[A-G][#b]?\d$/i.test(t)) {
      out += `<span class="tok-note" data-track="${track}" data-step="${step}">${esc(t)}</span>`;
      step++;
    } else {
      out += esc(t);
    }
  }
  return { html: out, step };
}

function highlightChordBody(track, body, startStep = 0) {
  const re = /(\s+|\[|\]|<|>|[^\s\[\]<>]+)/g;
  let out = '', step = startStep, m;
  while ((m = re.exec(body)) !== null) {
    const t = m[0];
    if (/^\s+$/.test(t)) { out += t; continue; }
    if (t === '[' || t === ']' || t === '<' || t === '>') {
      out += `<span class="tok-bracket">${esc(t)}</span>`; continue;
    }
    if (t === ':') { out += ':'; continue; }
    if (t === '.' || t === '-' || t === '_') {
      out += `<span class="tok-step-off" data-track="${track}" data-step="${step}">${t}</span>`;
      continue;
    }
    out += `<span class="tok-chord" data-track="${track}" data-step="${step}">${esc(t)}</span>`;
    step++;
  }
  return { html: out, step };
}

export function highlight(text) {
  let lastTrack = null;
  let lastKind = null;
  let lastStep = 0;
  return text.split('\n').map(line => {
    const ci = line.indexOf('//');
    let code = line, comment = '';
    if (ci !== -1) {
      code = line.slice(0, ci);
      comment = line.slice(ci);
    }

    const isIndented = /^\s+\S/.test(code);

    if (!code.trim() && /^\/\/\s*[a-z]+\s*:/i.test(comment)) {
      lastTrack = null;
      lastKind = null;
      lastStep = 0;
    }

    let html = '';
    if (code.trimStart().startsWith('@')) {
      html = esc(code)
        .replace(/(@\w+)/, '<span class="tok-directive">$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="tok-num">$1</span>');
    } else if (isIndented && !code.includes(':') && lastTrack && code.trim()) {
      let result;
      if (lastKind === 'drum') result = highlightDrumBody(lastTrack, code, lastStep);
      else if (lastKind === 'note') result = highlightNoteBody(lastTrack, code, lastStep);
      else if (lastKind === 'chord') result = highlightChordBody(lastTrack, code, lastStep);
      if (result) {
        html = result.html;
        lastStep = lastKind === 'chord' ? result.step : Math.max(result.step, lastStep + 16);
      } else {
        html = esc(code);
      }
    } else if (code.includes(':')) {
      const idx = code.indexOf(':');
      const rawName = code.slice(0, idx);
      const trackName = rawName.trim().toLowerCase();
      const track = trackName === 'hihat' ? 'hat' : trackName;
      const body = code.slice(idx);
      if (trackName === 'loop') {
        const numHtml = esc(body).replace(/\b(\d+)\b/, '<span class="tok-num">$1</span>');
        html = `<span class="tok-directive">${esc(rawName)}</span>${numHtml}`;
      } else {
        let result, kind = null;
        if (DRUM_NAMES.has(trackName)) { result = highlightDrumBody(track, body, 0); kind = 'drum'; }
        else if (NOTE_NAMES.has(trackName)) { result = highlightNoteBody(track, body, 0); kind = 'note'; }
        else if (CHORD_NAMES.has(trackName)) { result = highlightChordBody(track, body, 0); kind = 'chord'; }
        const bodyHtml = result ? result.html : esc(body);
        html = `<span class="tok-track">${esc(rawName)}</span>${bodyHtml}`;
        if (kind) {
          lastTrack = track;
          lastKind = kind;
          lastStep = kind === 'chord' ? result.step : Math.max(result.step, 16);
        }
      }
    } else {
      html = esc(code);
    }
    if (comment) html += `<span class="tok-comment">${esc(comment)}</span>`;
    return html;
  }).join('\n');
}
