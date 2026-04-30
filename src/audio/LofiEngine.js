import * as Tone from 'tone';
import { chordToNotes } from '../dsl/notes.js';

const SAMPLES_BASE = '/samples/';

export class LofiEngine {
  constructor(onStep) {
    this.parts = [];
    this.synths = {};
    this.fxChain = null;
    this.onStep = onStep || (() => {});
    this._vocalUrl = null;
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

// --- Sampler-based melodic instruments ---

// Piano: lead:default, chord:default
this.synths.piano = new Tone.Sampler({
  urls: {
    A1: 'A1.mp3', C2: 'C2.mp3', A2: 'A2.mp3', C3: 'C3.mp3',
    A3: 'A3.mp3', C4: 'C4.mp3', A4: 'A4.mp3', C5: 'C5.mp3',
    A5: 'A5.mp3', C6: 'C6.mp3', A6: 'A6.mp3', C7: 'C7.mp3',
  },
  baseUrl: SAMPLES_BASE + 'piano/',
}).connect(this.fxChain);
this.synths.piano.volume.value = -10;

// Guitar-nylon: lead:pluck, chord:guitar
this.synths.guitarNylon = new Tone.Sampler({
  urls: {
    A2: 'A2.mp3', E3: 'E3.mp3', A3: 'A3.mp3',
    E4: 'E4.mp3', A4: 'A4.mp3', E5: 'E5.mp3',
  },
  baseUrl: SAMPLES_BASE + 'guitar-nylon/',
}).connect(this.fxChain);
this.synths.guitarNylon.volume.value = -8;

// Flute: lead:flute
this.synths.flute = new Tone.Sampler({
  urls: {
    A4: 'A4.mp3', C5: 'C5.mp3', E5: 'E5.mp3',
    A5: 'A5.mp3', C6: 'C6.mp3',
  },
  baseUrl: SAMPLES_BASE + 'flute/',
}).connect(this.fxChain);
this.synths.flute.volume.value = -10;

// Xylophone: lead:marimba (available: G4, C5, G5, C6)
this.synths.xylophone = new Tone.Sampler({
  urls: {
    G4: 'G4.mp3', C5: 'C5.mp3', G5: 'G5.mp3', C6: 'C6.mp3',
  },
  baseUrl: SAMPLES_BASE + 'xylophone/',
}).connect(this.fxChain);
this.synths.xylophone.volume.value = -6;

// Bass-electric: bass:default, bass:slap, bass:upright (available: E1-E3, G1-G3)
this.synths.bassElectric = new Tone.Sampler({
  urls: {
    E1: 'E1.mp3', G1: 'G1.mp3', E2: 'E2.mp3',
    G2: 'G2.mp3', E3: 'E3.mp3', G3: 'G3.mp3',
  },
  baseUrl: SAMPLES_BASE + 'bass-electric/',
}).connect(this.fxChain);
this.synths.bassElectric.volume.value = -6;

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

this.loaded = Promise.all([
  this.synths.piano.loaded,
  this.synths.guitarNylon.loaded,
  this.synths.flute.loaded,
  this.synths.xylophone.loaded,
  this.synths.bassElectric.loaded,
]);
  }

  applyFX(fx) {
    const vinyl = fx.vinyl ?? 0.15;
    this.vinylGain.gain.rampTo(vinyl * 0.025, 0.2);

    const rev = fx.reverb ?? 0.25;
    this.reverb.wet.rampTo(rev, 0.2);

    const bright = fx.lowpass ?? fx.brightness ?? 0.55;
    const cutoff = 40 + bright * 450;
    this.lowpass.frequency.rampTo(cutoff, 0.3);
  }

  selectInstruments(instruments = {}) {
    const INST_MAP = {
      lead:  { default: 'piano', pluck: 'guitarNylon', marimba: 'xylophone', bell: 'leadBell', flute: 'flute' },
      bass:  { default: 'bassElectric', slap: 'bassElectric', upright: 'bassElectric', sub: 'bassSub' },
      chord: { default: 'piano', guitar: 'guitarNylon', stab: 'chordStab', pad: 'chordPad' },
    };
    const BASE_VOL = {
      piano: -10, guitarNylon: -8, xylophone: -6, flute: -10, leadBell: -14,
      bassElectric: -6, bassSub: -4,
      chordStab: -12, chordPad: -10,
    };
    const gainToDb = g => 20 * Math.log10(Math.max(0.0001, g));
    const resolve = (role, inst) => {
      const type = inst?.type || 'default';
      const intensity = inst?.intensity ?? 1.0;
      const key = INST_MAP[role]?.[type] ?? INST_MAP[role]?.default;
      const synth = this.synths[key];
      synth.volume.value = (BASE_VOL[key] ?? -10) + gainToDb(intensity);
      return synth;
    };

    this.activeLead  = resolve('lead',  instruments.lead);
    this.activeBass  = resolve('bass',  instruments.bass);
    this.activeChord = resolve('chord', instruments.chord);

    const chordDurs = { stab: '8n', guitar: '4n', pad: '1n' };
    this.activeChordDur = chordDurs[instruments.chord?.type] || '1n';
  }

  loadVocal(filename) {
    const url = '/vocals/' + filename;
    if (this._vocalUrl === url) return;
    if (this.synths.vocal) {
      try { this.synths.vocal.stop(); this.synths.vocal.dispose(); } catch (e) {}
      this.synths.vocal = null;
    }
    this.synths.vocal = new Tone.Player({ url, loop: false }).connect(this.fxChain);
    this.synths.vocal.volume.value = -8;
    this._vocalUrl = url;
  }

  schedule(pattern) {
    this.clear();
    if (pattern.samples?.vocal) this.loadVocal(pattern.samples.vocal);
    this.applyFX(pattern.fx);
    this.selectInstruments(pattern.instruments);

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
        if (notes[i]) this.activeBass.triggerAttackRelease(notes[i], '8n', time);
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
          if (this.activeLead.triggerAttackRelease) {
            this.activeLead.triggerAttackRelease(notes[i], '8n', time);
          } else {
            this.activeLead.triggerAttack(notes[i], time);
          }
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
        const notes = chordToNotes(chords[i]);
        this.activeChord.triggerAttackRelease(notes, this.activeChordDur, time);
        Tone.Draw.schedule(() => this.onStep('chords', i), time);
      }, indices, '1m');
      part.start(0);
      this.parts.push(part);
    }
  }

  triggerDrum(name, time) {
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
    } else if (name === 'vocal') {
      const v = this.synths.vocal;
      if (v && v.loaded) {
        try { v.stop(time); v.start(time); } catch (e) {}
      }
    }
  }

  clear() {
    for (const p of this.parts) {
      try { p.stop(); p.dispose(); } catch (e) { /* noop */ }
    }
    this.parts = [];
    if (this.synths.vocal) {
      try { this.synths.vocal.stop(); } catch (e) {}
    }
    for (const k of ['piano', 'guitarNylon', 'flute', 'xylophone', 'leadBell', 'chordStab', 'chordPad']) {
      try { this.synths[k]?.releaseAll?.(); } catch (e) { /* noop */ }
    }
    try { this.synths.bassElectric?.releaseAll?.(); } catch (e) { /* noop */ }
    try { this.synths.bassSub?.triggerRelease?.(); } catch (e) { /* noop */ }
  }

  start() { Tone.Transport.start(); }
  stop() { Tone.Transport.stop(); Tone.Transport.position = 0; }
}

export async function startAudioContext() {
  await Tone.start();
}
