import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/Header.jsx';
import { Editor } from './components/Editor.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Footer } from './components/Footer.jsx';
import { HomeScreen } from './HomeScreen.jsx';
import { parseDSL, isPlayable } from './dsl/parser.js';
import { useLofiEngine } from './hooks/useLofiEngine.js';
import { DEFAULT_LOFI } from './defaultLofi.js';

export default function App() {
  const [view, setView] = useState('home');
  const [text, setText] = useState(DEFAULT_LOFI);
  const [fileInfo, setFileInfo] = useState({
    name: 'rainy_window.lofi',
    size: DEFAULT_LOFI.length,
    note: 'default · click load to edit a file from disk',
  });
  const [isPlaying, setIsPlaying] = useState(false);
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

  function onTextChange(next) {
    setText(next);
    clearTimeout(editTimerRef.current);
    editTimerRef.current = setTimeout(async () => {
      const p = parseDSL(next);
      if (playingRef.current && engineRef.current && isPlayable(p)) {
        engineRef.current.schedule(p);
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

  // Play a track directly from the home grid without switching view.
  async function playFromHome(track) {
    const engine = await ensureEngine();
    if (engineRef.current) engineRef.current.stop();
    clearAllFlashes();
    const p = parseDSL(track.content);
    if (!isPlayable(p)) { setMsg('nothing playable in this file', true); return; }
    setText(track.content);
    setFileInfo({ name: track.file, size: track.content.length, note: 'playing from library' });
    setCurrentTrackId(track.id);
    engine.schedule(p);
    engine.start();
    setIsPlaying(true);
    setMsg('playing · ' + track.name);
  }

  function stopPlayback() {
    engineRef.current?.stop();
    setIsPlaying(false);
    setCurrentTrackId(null);
    clearAllFlashes();
    setMsg('stopped');
  }

  // Open a track in the editor (stop any current playback first).
  function handleSelectTrack(track) {
    if (engineRef.current) engineRef.current.stop();
    setIsPlaying(false);
    setCurrentTrackId(null);
    clearAllFlashes();
    fileHandleRef.current = null;
    setText(track.content);
    setFileInfo({ name: track.file, size: track.content.length, note: 'loaded from library' });
    setMsg('ready');
    setView('editor');
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
        engineRef.current.schedule(p);
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
    const engine = await ensureEngine();
    let value = text;
    const handle = fileHandleRef.current;
    if (handle) {
      const file = await handle.getFile();
      value = await file.text();
      setText(value);
    }
    const p = parseDSL(value);
    if (!isPlayable(p) && p.errors.length > 0) {
      setMsg('parse errors — nothing to play', true);
      return;
    }
    engine.schedule(p);
    engine.start();
    setIsPlaying(true);
    setMsg('playing');
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
