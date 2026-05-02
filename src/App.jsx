import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/Header.jsx';
import { Editor } from './components/Editor.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Footer } from './components/Footer.jsx';
import { HomeScreen } from './HomeScreen.jsx';
import { parseDSL, isPlayable } from './dsl/parser.js';
import { useLofiEngine } from './hooks/useLofiEngine.js';

export default function App() {
  const [view, setView] = useState('home');
  const [tracks, setTracks] = useState([]);
  const [text, setText] = useState('');
  const [fileInfo, setFileInfo] = useState({ name: '', size: 0, note: '' });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [status, setStatus] = useState({ msg: 'ready', error: false });

  const fileHandleRef = useRef(null);
  const preRef = useRef(null);
  const textareaRef = useRef(null);
  const activeByTrackRef = useRef(new Map());
  const editTimerRef = useRef(null);

  const pattern = useMemo(() => parseDSL(text), [text]);

  const flashCell = useCallback((track, step) => {
    const root = preRef.current;
    if (!root) return;
    const cell = root.querySelector(`[data-track="${track}"][data-step="${step}"]`);
    const active = activeByTrackRef.current;
    const prev = active.get(track);
    if (prev && prev !== cell) prev.classList.remove('tok-active');
    if (!cell) { active.delete(track); return; }
    cell.classList.add('tok-active');
    active.set(track, cell);
  }, []);

  const clearAllFlashes = useCallback(() => {
    for (const cell of activeByTrackRef.current.values()) cell.classList.remove('tok-active');
    activeByTrackRef.current.clear();
  }, []);

  const { engineRef, ensureEngine } = useLofiEngine(flashCell);

  useEffect(() => { activeByTrackRef.current.clear(); }, [text, pattern.errors.length]);

  const setMsg = useCallback((msg, error = false) => setStatus({ msg, error }), []);

  const saveToDisk = useCallback(async (value) => {
    const handle = fileHandleRef.current;
    if (!handle?.createWritable) return false;
    try {
      let perm = await handle.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') perm = await handle.requestPermission({ mode: 'readwrite' });
      if (perm !== 'granted') return false;
      const w = await handle.createWritable();
      await w.write(value);
      await w.close();
      return true;
    } catch (e) {
      setMsg('save failed: ' + e.message, true);
      return false;
    }
  }, [setMsg]);

  const playingRef = useRef(isPlaying);
  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);

  async function loadTracksFromDir() {
    try {
      const dir = await window.showDirectoryPicker();
      const loaded = [];
      for await (const [name, handle] of dir.entries()) {
        if (handle.kind !== 'file' || !name.endsWith('.lofi')) continue;
        const id = name.replace(/\.lofi$/, '');
        const displayName = id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const file = await handle.getFile();
        const content = await file.text();
        const tempoMatch = content.match(/@tempo\s+(\d+)/);
        const tags = tempoMatch ? [`${tempoMatch[1]} bpm`] : [];
        loaded.push({ id, name: displayName, file: name, fileHandle: handle, tags });
      }
      loaded.sort((a, b) => a.name.localeCompare(b.name));
      setTracks(loaded);
    } catch (e) {
      if (e.name !== 'AbortError') setMsg('load failed: ' + e.message, true);
    }
  }

  function onTextChange(next) {
    setText(next);
    clearTimeout(editTimerRef.current);
    editTimerRef.current = setTimeout(async () => {
      const p = parseDSL(next);
      if (playingRef.current && engineRef.current && isPlayable(p)) {
        await engineRef.current.schedule(p);
      }
      const saved = await saveToDisk(next);
      if (saved) {
        const ts = new Date().toLocaleTimeString();
        const handle = fileHandleRef.current;
        const file = await handle.getFile();
        setFileInfo({ name: file.name, size: file.size, note: 'saved ' + ts });
        setMsg(playingRef.current ? 'saved · playing' : 'saved');
      } else if (fileHandleRef.current) {
        setMsg('edited (not saved)');
      } else {
        setMsg('edited');
      }
    }, 350);
  }

  async function playFromHome(track) {
    setIsLoading(true);
    setMsg('loading...');
    try {
      const engine = await ensureEngine();
      if (engineRef.current) engineRef.current.stop();
      clearAllFlashes();
      const file = await track.fileHandle.getFile();
      const content = await file.text();
      const p = parseDSL(content);
      if (!isPlayable(p)) { setMsg('nothing playable in this file', true); setIsLoading(false); return; }
      setText(content);
      setFileInfo({ name: track.file, size: content.length, note: 'playing from library' });
      setCurrentTrackId(track.id);
      await engine.schedule(p);
      engine.start();
      setIsPlaying(true);
      setIsLoading(false);
      setMsg('playing · ' + track.name);
    } catch (e) {
      setIsLoading(false);
      setMsg('playback error: ' + e.message, true);
    }
  }

  function stopPlayback() {
    engineRef.current?.stop();
    setIsPlaying(false);
    setCurrentTrackId(null);
    clearAllFlashes();
    setMsg('stopped');
  }

  async function handleSelectTrack(track) {
    if (engineRef.current) engineRef.current.stop();
    setIsPlaying(false);
    setCurrentTrackId(null);
    clearAllFlashes();
    try {
      fileHandleRef.current = track.fileHandle;
      const file = await track.fileHandle.getFile();
      const value = await file.text();
      setText(value);
      setFileInfo({ name: file.name, size: file.size, note: 'loaded from library' });
      setMsg('ready');
      setView('editor');
    } catch (e) {
      setMsg('load failed: ' + e.message, true);
    }
  }

  async function loadFile() {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'Lofi DSL', accept: { 'text/plain': ['.lofi', '.txt', '.beat'] } }],
      });
      fileHandleRef.current = handle;
      const file = await handle.getFile();
      const value = await file.text();
      setText(value);
      setFileInfo({ name: file.name, size: file.size, note: 'just loaded' });
      setMsg('file loaded');
      setView('editor');
    } catch (e) {
      if (e.name !== 'AbortError') setMsg('load failed: ' + e.message, true);
    }
  }

  async function reloadFile() {
    const handle = fileHandleRef.current;
    if (!handle) return;
    try {
      const file = await handle.getFile();
      const value = await file.text();
      setText(value);
      const p = parseDSL(value);
      if (playingRef.current && engineRef.current) {
        await engineRef.current.schedule(p);
        setMsg('reloaded · playing');
      } else {
        setMsg('reloaded');
      }
      const ts = new Date().toLocaleTimeString();
      setFileInfo({ name: file.name, size: file.size, note: 'reloaded ' + ts });
    } catch (e) {
      setMsg('reload failed: ' + e.message, true);
    }
  }

  async function play() {
    console.log('[play] START');
    setIsLoading(true);
    setMsg('loading...');
    try {
      console.log('[play] Ensuring engine...');
      const engine = await ensureEngine();
      console.log('[play] Engine ready');
      let value = text;
      const handle = fileHandleRef.current;
      if (handle) {
        const file = await handle.getFile();
        value = await file.text();
        setText(value);
      }
      const p = parseDSL(value);
      if (!isPlayable(p) && p.errors.length > 0) {
        console.log('[play] Parse errors');
        setMsg('parse errors — nothing to play', true);
        setIsLoading(false);
        return;
      }
      console.log('[play] About to call engine.schedule()...');
      const scheduleStart = Date.now();
      await engine.schedule(p);
      const scheduleElapsed = Date.now() - scheduleStart;
      console.log(`[play] engine.schedule() completed in ${scheduleElapsed}ms`);
      console.log('[play] About to call engine.start()...');
      engine.start();
      console.log('[play] engine.start() called');
      setIsPlaying(true);
      setIsLoading(false);
      setMsg('playing');
    } catch (e) {
      console.error('[play] Error:', e);
      setIsLoading(false);
      setMsg('playback error: ' + e.message, true);
    }
  }

  function stop() {
    engineRef.current?.stop();
    setIsPlaying(false);
    setCurrentTrackId(null);
    clearAllFlashes();
    setMsg('stopped');
  }

  useEffect(() => {
    function onKeyDown(e) {
      const editing = document.activeElement === textareaRef.current;
      if (e.code === 'Space' && !editing && view === 'editor') {
        e.preventDefault();
        if (playingRef.current) stop(); else play();
      } else if (e.code === 'KeyR' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        reloadFile();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const headerStatus = status.error ? 'error' : (isPlaying ? 'playing' : 'ready');

  return (
    <>
      <Header
        status={headerStatus}
        view={view}
        onHome={() => { stop(); setView('home'); }}
      />
      <main className={view === 'home' ? 'main-home' : ''}>
        {view === 'home' ? (
          <HomeScreen
            tracks={tracks}
            onPickFolder={loadTracksFromDir}
            onSelect={handleSelectTrack}
            onPlay={playFromHome}
            onStop={stopPlayback}
            playingId={currentTrackId}
            isPlaying={isPlaying}
          />
        ) : (
          <>
            <Editor
              text={text}
              errors={pattern.errors}
              onChange={onTextChange}
              preRef={preRef}
              textareaRef={textareaRef}
            />
            <Sidebar file={fileInfo} pattern={pattern} />
          </>
        )}
      </main>
      {view === 'editor' && (
        <Footer
          status={status.msg}
          isError={status.error}
          isPlaying={isPlaying}
          isLoading={isLoading}
          canReload={!!fileHandleRef.current}
          canPlay={true}
          onLoad={loadFile}
          onReload={reloadFile}
          onPlay={play}
          onStop={stop}
        />
      )}
    </>
  );
}
