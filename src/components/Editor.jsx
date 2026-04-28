import { useMemo } from 'react';
import { highlight } from '../dsl/highlight.js';

export function Editor({ text, errors, onChange, preRef, textareaRef }) {
  const html = useMemo(() => {
    if (!text) return null;
    const padded = text.endsWith('\n') ? text + ' ' : text + '\n ';
    let out = highlight(padded);
    if (errors.length > 0) {
      const errs = errors.map(e => '⚠ ' + e).join('<br>');
      out += `\n<div style="color:var(--error);font-size:11px;">${errs}</div>`;
    }
    return out;
  }, [text, errors]);

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const s = ta.selectionStart, end = ta.selectionEnd;
      const next = ta.value.slice(0, s) + '  ' + ta.value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = s + 2;
      });
    }

    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const ta = e.currentTarget;
      const s = ta.selectionStart, end = ta.selectionEnd;
      if (s === end) return;
      e.preventDefault();
      const delta = e.key === 'ArrowUp' ? 1 : -1;
      const selected = ta.value.slice(s, end);
      const transposed = selected.replace(/([A-G][#b]?)(\d)/g, (_, note, oct) => {
        return note + Math.max(0, Math.min(9, parseInt(oct) + delta));
      });
      onChange(ta.value.slice(0, s) + transposed + ta.value.slice(end));
      requestAnimationFrame(() => {
        ta.selectionStart = s;
        ta.selectionEnd = s + transposed.length;
      });
    }
  }

  return (
    <section className="editor">
      <div className="editor-stack">
        {html ? (
          <pre ref={preRef} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre ref={preRef}>
            <span className="empty">
              <strong>no file loaded.</strong>
              {'\n'}press <code>load</code> to pick a .lofi file.
            </span>
          </pre>
        )}
        <textarea
          ref={textareaRef}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          hidden={!text}
          value={text}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </section>
  );
}
