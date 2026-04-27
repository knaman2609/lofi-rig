import { useEffect, useRef } from 'react';
import { LofiEngine, startAudioContext } from '../audio/LofiEngine.js';

export function useLofiEngine(onStep) {
  const engineRef = useRef(null);
  const onStepRef = useRef(onStep);

  useEffect(() => { onStepRef.current = onStep; }, [onStep]);

  async function ensureEngine() {
    if (!engineRef.current) {
      await startAudioContext();
      const engine = new LofiEngine((track, step) => onStepRef.current?.(track, step));
      await engine.loaded;
      engineRef.current = engine;
    }
    return engineRef.current;
  }

  return { engineRef, ensureEngine };
}
