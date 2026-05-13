import * as Tone from 'tone';
import { chordToNotes } from '../dsl/notes.js';

const SAMPLES_BASE = '/samples/';
const INSTRUMENTS_BASE = '/instruments/';

// Map from sample-name prefix to drum pack subfolder for resolving drum file paths.
const DRUM_FOLDER_MAP = { Kick: 'Kicks', Snare: 'Snares', HiHat: 'Hi Hats', Foley: 'Foley', Texture: 'Textures' };
const DRUM_VOLS = { kick: -3, snare: -8, hat: -14, clap: -10, perc: -16 };

function resolveDrumPath(name) {
  const prefix = name.split('_')[0]; // "kick_8bit" → "kick"
  let key;
  if (prefix === 'hihat') key = 'HiHat';
  else key = prefix.charAt(0).toUpperCase() + prefix.slice(1);

  const folder = DRUM_FOLDER_MAP[key];
  if (!folder) {
    console.error(`[resolveDrumPath] No folder for prefix="${prefix}", key="${key}"`);
    return null;
  }
  return `drums/${folder}/${name}.wav`;
}

export class LofiEngine {
  constructor(onStep) {
    this.parts = [];
    this.synths = {};
    this.fxChain = null;
    this.onStep = onStep || (() => {});
    this._stemPlayers = {};
    this._stemUrls = {};
    this.initFX();
    this.initInstruments();
  }

  initFX() {
    this.master = new Tone.Gain(0.85).toDestination();
    this.reverb = new Tone.Reverb({ decay: 3.5, wet: 0.25 }).connect(this.master);
    this.lowpass = new Tone.Filter(7000, 'lowpass').connect(this.reverb);
    this.eq = new Tone.EQ3(-2, 0, -4).connect(this.lowpass);
    this.compressor = new Tone.Compressor(-18, 3).connect(this.eq);
    this.fxChain = this.compressor;

    this.drumBus = new Tone.Gain(1).connect(this.master);

    this.vinylGain = new Tone.Gain(0).connect(this.lowpass);
    this.vinylFilter = new Tone.Filter(1200, 'highpass').connect(this.vinylGain);
    this.vinyl = new Tone.Noise('pink').connect(this.vinylFilter);
    this.vinyl.start();
  }

  initInstruments() {
    this.synths.kick = new Tone.MembraneSynth({
      pitchDecay: 0.05, octaves: 6,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
      volume: -2,
    }).connect(this.drumBus);

    this.synths.snare = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.005, decay: 0.15, sustain: 0 },
volume: -22,
    }).connect(this.drumBus);
    this.synths.snareBody = new Tone.MembraneSynth({
      pitchDecay: 0.02, octaves: 2,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0 },
      volume: -18,
    }).connect(this.drumBus);

    this.synths.hatFilter = new Tone.Filter(8000, 'highpass').connect(this.drumBus);
    this.synths.hat = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0 },
volume: -30,
    }).connect(this.synths.hatFilter);

    this.synths.clap = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.001, decay: 0.18, sustain: 0 },
      volume: -16,
    }).connect(this.drumBus);

    this.synths.perc = new Tone.MetalSynth({
      frequency: 200,
      envelope: { attack: 0.001, decay: 0.1, release: 0.2 },
      harmonicity: 3.1, modulationIndex: 16, resonance: 4000, octaves: 0.5,
      volume: -28,
    }).connect(this.drumBus);

    this.synths.bass = new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.6, release: 0.3 },
      filter: { Q: 1, type: 'lowpass', rolloff: -24 },
      filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.4, baseFrequency: 200, octaves: 2 },
      volume: -8,
    }).connect(this.fxChain);

// --- Synthesized fallbacks for types better served by synthesis ---

// lead:bell
this.synths.leadBell = new Tone.PolySynth(Tone.FMSynth, {
  harmonicity: 3.01,
  modulationIndex: 14,
  oscillator: { type: 'sine' },
  envelope: { attack: 0.001, decay: 1.5, sustain: 0, release: 1.5 },
  modulation: { type: 'square' },
  modulationEnvelope: { attack: 0.002, decay: 0.2, sustain: 0, release: 0.2 },
}).connect(this.fxChain);
this.synths.leadBell.volume.value = -14;

// chord:stab
this.synths.chordStab = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 0.01, decay: 0.08, sustain: 0.15, release: 0.4 },
}).connect(this.fxChain);
this.synths.chordStab.volume.value = -12;

// chord:pad
this.synths.chordPad = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sine' },
  envelope: { attack: 0.8, decay: 0.5, sustain: 0.8, release: 2.5 },
}).connect(this.fxChain);
this.synths.chordPad.volume.value = -10;

// bass:sub
this.synths.bassSub = new Tone.MonoSynth({
  oscillator: { type: 'sine' },
  envelope: { attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.5 },
  filter: { Q: 1, type: 'lowpass', rolloff: -48 },
  filterEnvelope: { attack: 0.05, decay: 0.3, sustain: 0.5, release: 0.5, baseFrequency: 80, octaves: 1.5 },
  volume: -4,
}).connect(this.fxChain);

// --- ALL sampled instruments (lazy-loaded on demand) ---
// Store instrument configs but don't load until needed
this._instrumentConfigs = {
  piano:          { folder: 'piano',           vol: -10, notes: ['A1','C2','A2','C3','A3','C4','A4','C5','A5','C6','A6','C7'] },
  guitarNylon:    { folder: 'guitar-nylon',    vol: -8,  notes: ['A2','E3','A3','E4','A4','E5'] },
  flute:          { folder: 'flute',           vol: -10, notes: ['A4','C5','E5','A5','C6'] },
  xylophone:      { folder: 'xylophone',       vol: -6,  notes: ['G4','C5','G5','C6'] },
  bassElectric:   { folder: 'bass-electric',   vol: -6,  notes: ['E1','G1','E2','G2','E3','G3'] },
  cello:          { folder: 'cello',           vol: -10, notes: ['A2','A3','A4','As2','As3','B2','B3','B4','C2','C3','C4','C5','Cs3','Cs4','D2','D3','D4','Ds2','Ds3','Ds4','E2','E3','E4','F2','F3','F4','Fs3','Fs4','G2','G3','G4','Gs2','Gs3','Gs4'] },
  violin:         { folder: 'violin',          vol: -12, notes: ['A3','A4','A5','A6','C4','C5','C6','C7','E4','E5','E6','G3','G4','G5','G6'] },
  saxophone:      { folder: 'saxophone',       vol: -12, notes: ['A4','A5','As3','As4','B3','B4','C4','C5','Cs3','Cs4','Cs5','D3','D4','D5','Ds3','Ds4','Ds5','E3','E4','E5','F3','F4','F5','Fs3','Fs4','Fs5','G3','G4','G5','Gs3','Gs4','Gs5'] },
  trumpet:        { folder: 'trumpet',         vol: -16, notes: ['A3','A5','As4','C4','C6','D5','Ds4','F3','F4','F5','G4'] },
  clarinet:       { folder: 'clarinet',        vol: -10, notes: ['As3','As4','As5','D3','D4','D5','D6','F3','F4','F5','Fs6'] },
  harp:           { folder: 'harp',            vol: -8,  notes: ['A2','A4','A6','B1','B3','B5','B6','C3','C5','D2','D4','D6','D7','E1','E3','E5','F2','F4','F6','F7','G1','G3','G5'] },
  bassoon:        { folder: 'bassoon',         vol: -10, notes: ['A2','A3','A4','C3','C4','C5','E4','G2','G3','G4'] },
  frenchHorn:     { folder: 'french-horn',     vol: -10, notes: ['A1','A3','C2','C4','D3','D5','Ds2','F3','F5','G2'] },
  organ:          { folder: 'organ',           vol: -14, notes: ['A1','A2','A3','A4','A5','C1','C2','C3','C4','C5','C6','Ds1','Ds2','Ds3','Ds4','Ds5','Fs1','Fs2','Fs3','Fs4','Fs5'] },
  harmonium:      { folder: 'harmonium',       vol: -10, notes: ['A2','A3','A4','As2','As3','As4','B2','B3','B4','C2','C3','C4','C5','Cs2','Cs3','Cs4','Cs5','D2','D3','D4','D5','Ds2','Ds3','Ds4','E2','E3','E4','F2','F3','F4','Fs2','Fs3','G2','G3','G4','Gs2','Gs3','Gs4'] },
  guitarAcoustic: { folder: 'guitar-acoustic', vol: -8,  notes: ['A2','A3','A4','As2','As3','As4','B2','B3','B4','C3','C4','C5','Cs3','Cs4','Cs5','D2','D3','D4','D5','Ds2','Ds3','Ds4','E2','E3','E4','F2','F3','F4','Fs2','Fs3','Fs4','G2','G3','G4','Gs2','Gs3','Gs4'] },
  guitarElectric: { folder: 'guitar-electric', vol: -10, notes: ['A2','A3','A4','A5','C3','C4','C5','C6','Cs2','Ds3','Ds4','Ds5','E2','Fs2','Fs3','Fs4','Fs5'] },
  tuba:           { folder: 'tuba',            vol: -8,  notes: ['As1','As2','As3','D3','D4','Ds2','F1','F2','F3'] },
  trombone:       { folder: 'trombone',        vol: -10, notes: ['As1','As2','As3','C3','C4','Cs2','Cs4','D3','D4','Ds2','Ds3','Ds4','F2','F3','F4','Gs2','Gs3'] },
  contrabass:     { folder: 'contrabass',      vol: -10, notes: ['A2','As1','B3','C2','Cs3','D2','E2','E3','Fs1','Fs2','G1','Gs2','Gs3'] },
};

// --- Sampled lofi drums (Clark Audio Lofi Cookout) ---
// Cache samplers by URL so switching kits across beats doesn't reload buffers.
this._drumCache = {};
this.activeDrums = {};

this.loaded = Promise.resolve();
  }

  _buildUrls(notes) {
    const urls = {};
    for (const n of notes) {
      // Handle both formats: 'As2' (from config) or 'A#2' (Tone format)
      const key = n.replace(/s/g, '#');
      urls[key] = n + '.mp3';
    }
    return urls;
  }

  _getOrCreateInstrument(key, requiredNotes = null) {
    if (this.synths[key]) return this.synths[key];

    const config = this._instrumentConfigs[key];
    if (!config) {
      console.warn('[instrument] No config for:', key);
      return null;
    }

    // Use only required notes, or fall back to config notes
    const notesToLoad = requiredNotes ?
      config.notes.filter(n => requiredNotes.has(n.replace(/s/g, '#'))) :
      config.notes;

    console.log('[instrument] Loading', key, 'with', notesToLoad.length, 'notes');
    this.synths[key] = new Tone.Sampler({
      urls: this._buildUrls(notesToLoad),
      baseUrl: INSTRUMENTS_BASE + config.folder + '/'
    }).connect(this.fxChain);
    this.synths[key].volume.value = config.vol;
    this.synths[key]._loadingKey = key;
    return this.synths[key];
  }

  _getOrCreateDrumSampler(role, name) {
    console.log(`[_getOrCreateDrumSampler] role="${role}", name="${name}"`);
    const url = resolveDrumPath(name);
    console.log(`[_getOrCreateDrumSampler] url="${url}"`);
    if (!url) {
      console.error(`[_getOrCreateDrumSampler] Failed to resolve path for "${name}"`);
      return null;
    }

    if (!this._drumCache[url]) {
      console.log(`[_getOrCreateDrumSampler] Creating new Sampler, url="${url}"`);
      const sampler = new Tone.Sampler({
        urls: { 'C1': url },
        baseUrl: '/samples/'
      }).connect(this.drumBus);

      console.log(`[_getOrCreateDrumSampler] Sampler created`);

      // Create a promise that resolves when sampler.loaded becomes true
      sampler._loadPromise = new Promise(resolve => {
        let resolved = false;
        let checkCount = 0;
        const checkLoaded = () => {
          checkCount++;
          if (sampler.loaded) {
            resolved = true;
            console.log(`[_getOrCreateDrumSampler] ✓ Sampler loaded for "${name}" (checked ${checkCount} times)`);
            resolve();
          } else {
            if (checkCount === 1) {
              console.log(`[_getOrCreateDrumSampler] Waiting for "${name}" to load... sampler.loaded=${sampler.loaded}`);
            }
            setTimeout(checkLoaded, 100);
          }
        };
        // Timeout after 5 seconds
        setTimeout(() => {
          if (!resolved) {
            console.warn(`[_getOrCreateDrumSampler] ⚠ Timeout waiting for "${name}" after 5s (${checkCount} checks), sampler.loaded=${sampler.loaded}`);
            resolved = true;
            resolve();
          }
        }, 5000);
        checkLoaded();
      });

      this._drumCache[url] = sampler;
    } else {
      console.log(`[_getOrCreateDrumSampler] Using cached sampler for url="${url}"`);
    }

    const cached = this._drumCache[url];
    cached.volume.value = DRUM_VOLS[role] ?? -10;
    return cached;
  }

  applyFX(fx) {
    const vinyl = fx.vinyl ?? 0.15;
    this.vinylGain.gain.rampTo(vinyl * 0.15, 0.2);

    const rev = fx.reverb ?? 0.25;
    this.reverb.wet.rampTo(rev, 0.2);

    const bright = fx.lowpass ?? fx.brightness ?? 0.55;
    const cutoff = 40 + bright * 450;
    this.lowpass.frequency.rampTo(cutoff, 0.3);
  }

  _extractRequiredNotes(pattern, role) {
    const required = new Set();
    if (role === 'lead' && pattern.lead?.notes) {
      pattern.lead.notes.forEach(n => n && required.add(n));
    } else if (role === 'bass' && pattern.bass?.notes) {
      pattern.bass.notes.forEach(n => n && required.add(n));
    } else if (role === 'chord' && pattern.chords?.chords) {
      pattern.chords.chords.forEach(chord => {
        const notes = chordToNotes(chord);
        notes.forEach(n => required.add(n));
      });
    }
    return required.size > 0 ? required : null;
  }

  selectInstruments(instruments = {}, pattern = null) {
    console.log('[selectInstruments] START, instruments:', instruments);
    const INST_MAP = {
      lead:  {
        default: 'piano', pluck: 'guitarNylon', marimba: 'xylophone', bell: 'leadBell', flute: 'flute',
        cello: 'cello', violin: 'violin', sax: 'saxophone', trumpet: 'trumpet', clarinet: 'clarinet',
        harp: 'harp', bassoon: 'bassoon', horn: 'frenchHorn', organ: 'organ', harmonium: 'harmonium',
        acoustic: 'guitarAcoustic', electric: 'guitarElectric',
      },
      bass:  {
        default: 'bassElectric', slap: 'bassElectric', upright: 'bassElectric', sub: 'bassSub',
        contrabass: 'contrabass', tuba: 'tuba', trombone: 'trombone', cello: 'cello',
      },
      chord: {
        default: 'piano', guitar: 'guitarNylon', stab: 'chordStab', pad: 'chordPad',
        acoustic: 'guitarAcoustic', electric: 'guitarElectric', organ: 'organ',
        harmonium: 'harmonium', strings: 'cello',
      },
    };
    const BASE_VOL = {
      piano: -10, guitarNylon: -8, xylophone: -6, flute: -10, leadBell: -14,
      bassElectric: -6, bassSub: -4,
      chordStab: -12, chordPad: -10,
      cello: -10, violin: -12, saxophone: -12, trumpet: -16, clarinet: -10,
      harp: -8, bassoon: -10, frenchHorn: -10, organ: -14, harmonium: -10,
      guitarAcoustic: -8, guitarElectric: -10, tuba: -8, trombone: -10, contrabass: -10,
    };
    const gainToDb = g => 20 * Math.log10(Math.max(0.0001, g));
    const resolve = (role, inst) => {
      console.log(`[selectInstruments.resolve] role=${role}, inst=`, inst);
      const type = inst?.type || 'default';
      const intensity = inst?.intensity ?? 1.0;
      const key = INST_MAP[role]?.[type] ?? INST_MAP[role]?.default;
      console.log(`[selectInstruments.resolve]   type=${type}, key=${key}`);

      // Lazy-load sampled instruments with only required notes
      let synth = this.synths[key];
      console.log(`[selectInstruments.resolve]   this.synths[${key}] exists?`, !!synth);

      if (!synth && this._instrumentConfigs[key]) {
        console.log(`[selectInstruments.resolve]   Creating new instrument ${key}`);
        const requiredNotes = pattern ? this._extractRequiredNotes(pattern, role) : null;
        synth = this._getOrCreateInstrument(key, requiredNotes);
        console.log(`[selectInstruments.resolve]   Created: ${synth?.constructor?.name}, _buffers=${!!synth?._buffers}`);
      }

      if (!synth) {
        console.warn('[selectInstruments] No synth for role', role, 'type', type, 'key', key);
        return null;
      }

      synth.volume.value = (BASE_VOL[key] ?? -10) + gainToDb(intensity);
      console.log(`[selectInstruments.resolve]   ✓ Set volume, returning ${synth.constructor.name}`);
      return synth;
    };

    console.log('[selectInstruments] Resolving instruments...');
    this.activeLead  = resolve('lead',  instruments.lead);
    console.log('[selectInstruments] activeLead set:', !!this.activeLead, this.activeLead?.constructor?.name);

    this.activeBass  = resolve('bass',  instruments.bass);
    console.log('[selectInstruments] activeBass set:', !!this.activeBass, this.activeBass?.constructor?.name);

    this.activeChord = resolve('chord', instruments.chords || instruments.chord);
    console.log('[selectInstruments] activeChord set:', !!this.activeChord, this.activeChord?.constructor?.name);

    const chordDurs = { stab: '8n', guitar: '4n', pad: '1n', acoustic: '4n', electric: '4n', organ: '1n', harmonium: '1n', strings: '1n' };
    this.activeChordDur = chordDurs[(instruments.chords || instruments.chord)?.type] || '1n';
  }

  loadStem(name, filename, intensity = 1.0) {
    const url = '/samples/' + filename;
    if (this._stemUrls[name] === url) return;
    if (this._stemPlayers[name]) {
      try { this._stemPlayers[name].stop(); this._stemPlayers[name].dispose(); } catch (e) {}
      this._stemPlayers[name] = null;
    }
    this._stemPlayers[name] = new Tone.Player({ url, loop: false }).connect(this.drumBus);
    const gainToDb = g => 20 * Math.log10(Math.max(0.0001, g));
    this._stemPlayers[name].volume.value = 6 + gainToDb(intensity);
    this._stemUrls[name] = url;
  }

  async schedule(pattern) {
    console.log('\n=== SCHEDULE START ===');
    console.log('[schedule] pattern keys:', Object.keys(pattern));
    console.log('[schedule] pattern.instruments:', pattern.instruments);

    this.clear();
    for (const [name, sample] of Object.entries(pattern.samples ?? {})) {
      const file = typeof sample === 'string' ? sample : sample.file;
      const intensity = typeof sample === 'string' ? 1.0 : (sample.intensity ?? 1.0);
      this.loadStem(name, file, intensity);
    }

    this.applyFX(pattern.fx);

    console.log('[schedule] CALLING selectInstruments');
    this.selectInstruments(pattern.instruments, pattern);
    console.log('[schedule] AFTER selectInstruments, activeLead/Bass/Chord:', {
      lead: this.activeLead?.constructor?.name,
      bass: this.activeBass?.constructor?.name,
      chord: this.activeChord?.constructor?.name,
    });

    console.log('[schedule] === DRUM LOADING START ===');
    console.log(`[schedule] activeDrums has ${Object.keys(this.activeDrums).length} drums:`, Object.keys(this.activeDrums));

    const drumLoadPromises = [];
    for (const [role, sampler] of Object.entries(this.activeDrums)) {
      if (sampler?._loadPromise) {
        console.log(`[schedule] Adding _loadPromise for drum: ${role}`);
        drumLoadPromises.push(sampler._loadPromise);
      }
    }

    console.log(`[schedule] Total drum promises to wait for: ${drumLoadPromises.length}`);
    if (drumLoadPromises.length > 0) {
      console.log(`[schedule] AWAITING ${drumLoadPromises.length} drum(s)...`);
      const startTime = Date.now();
      await Promise.all(drumLoadPromises);
      const elapsed = Date.now() - startTime;
      console.log(`[schedule] ✓ All drums loaded in ${elapsed}ms`);
    }

    console.log('[schedule] === DRUM LOADING COMPLETE, Ready, scheduling parts ===');

    Tone.Transport.bpm.value = pattern.tempo;
    Tone.Transport.swing = (pattern.swing - 0.5) * 2;
    Tone.Transport.swingSubdivision = '8n';

    for (const [name, steps] of Object.entries(pattern.drums)) {
      const indices = steps.map((_, i) => i);
      const part = new Tone.Sequence((time, i) => {
        if (steps[i]) this.triggerDrum(name, time);
        Tone.Draw.schedule(() => this.onStep(name, i), time);
      }, indices, '16n');
      part.start(0);
      this.parts.push(part);
    }

    if (pattern.bass) {
      const notes = pattern.bass.notes;
      const indices = notes.map((_, i) => i);
      const part = new Tone.Sequence((time, i) => {
        if (notes[i]) {
          try { this.activeBass.triggerAttackRelease(notes[i], '8n', time); }
          catch (e) { console.warn('[schedule] bass failed:', e.message); }
        }
        Tone.Draw.schedule(() => this.onStep('bass', i), time);
      }, indices, '16n');
      part.start(0);
      this.parts.push(part);
    }

    if (pattern.lead) {
      const notes = pattern.lead.notes;
      const indices = notes.map((_, i) => i);
      const part = new Tone.Sequence((time, i) => {
        if (notes[i]) {
          try {
            if (this.activeLead.triggerAttackRelease) {
              this.activeLead.triggerAttackRelease(notes[i], '8n', time);
            } else {
              this.activeLead.triggerAttack(notes[i], time);
            }
          } catch (e) { console.warn('[schedule] lead failed:', e.message); }
        }
        Tone.Draw.schedule(() => this.onStep('lead', i), time);
      }, indices, '16n');
      part.start(0);
      this.parts.push(part);
    }

    if (pattern.chords && pattern.chords.chords.length > 0) {
      const chords = pattern.chords.chords;
      const indices = chords.map((_, i) => i);
      const part = new Tone.Sequence((time, i) => {
        try {
          const notes = chordToNotes(chords[i]);
          this.activeChord.triggerAttackRelease(notes, this.activeChordDur, time);
        } catch (e) { console.warn('[schedule] chord failed:', e.message); }
        Tone.Draw.schedule(() => this.onStep('chords', i), time);
      }, indices, '1m');
      part.start(0);
      this.parts.push(part);
    }
  }

  triggerDrum(name, time) {
    if (this._stemPlayers[name]) {
      const p = this._stemPlayers[name];
      if (p && p.loaded) {
        try { p.stop(time); p.start(time); } catch (e) {}
      }
      return;
    }

    const sampler = this.activeDrums?.[name];
    if (sampler && sampler.loaded) {
      try {
        sampler.triggerAttackRelease('C1', '8n', time);
      } catch (e) {}
      return;
    }

    if (name === 'kick') {
      this.synths.kick.triggerAttackRelease('C1', '8n', time);
    } else if (name === 'snare') {
      this.synths.snare.triggerAttackRelease('16n', time);
      this.synths.snareBody.triggerAttackRelease('G2', '16n', time);
    } else if (name === 'hat') {
      this.synths.hat.triggerAttackRelease('32n', time);
    } else if (name === 'clap') {
      this.synths.clap.triggerAttackRelease('16n', time);
    } else if (name === 'perc') {
      this.synths.perc.triggerAttackRelease('32n', time);
    }
  }

  clear() {
    console.log('[clear] Clearing playback. Current activeDrums:', Object.keys(this.activeDrums));
    for (const p of this.parts) {
      try { p.stop(); p.dispose(); } catch (e) { /* noop */ }
    }
    this.parts = [];
    for (const player of Object.values(this._stemPlayers)) {
      try { player.stop(); } catch (e) {}
    }
    const samplerKeys = [
      'piano', 'guitarNylon', 'flute', 'xylophone', 'leadBell', 'chordStab', 'chordPad',
      'bassElectric',
      'cello', 'violin', 'saxophone', 'trumpet', 'clarinet', 'harp', 'bassoon', 'frenchHorn',
      'organ', 'harmonium', 'guitarAcoustic', 'guitarElectric', 'tuba', 'trombone', 'contrabass',
    ];
    for (const k of samplerKeys) {
      try { this.synths[k]?.releaseAll?.(); } catch (e) { /* noop */ }
    }
    try { this.synths.bassSub?.triggerRelease?.(); } catch (e) { /* noop */ }
  }

  start() { Tone.Transport.start(); }
  stop() { Tone.Transport.stop(); Tone.Transport.position = 0; }
}

export async function startAudioContext() {
  await Tone.start();
}
