import { useState, useEffect, useRef } from 'react';
import { Copy, Download, X } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface Props {
  jsonStr: string;
  open: boolean;
  section?: string;
  onClose: () => void;
}

function findJsonLine(text: string, path: string): number {
  const parts = path.split('.');
  const lines = text.split('\n');
  let currentDepth = 0;
  let targetKey = parts[0];
  let partIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith(`"${targetKey}"`)) {
      if (partIdx === parts.length - 1) {
        return i;
      }
      partIdx++;
      targetKey = parts[partIdx];
    }
    if (line.includes(`"${targetKey}"`)) {
      if (partIdx === parts.length - 1) {
        return i;
      }
      partIdx++;
      targetKey = parts[partIdx];
    }
  }

  return 0;
}

export default function JsonDrawer({ jsonStr, open, section, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<any>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (!open || !containerRef.current) return;

    let view: any = null;

    const initEditor = async () => {
      const { EditorView, keymap } = await import('@codemirror/view');
      const { EditorState } = await import('@codemirror/state');
      const { json } = await import('@codemirror/lang-json');
      const { oneDark } = await import('@codemirror/theme-one-dark');
      const { defaultKeymap } = await import('@codemirror/commands');

      const cmState = EditorState.create({
        doc: jsonStr,
        extensions: [
          json(),
          oneDark,
          EditorView.editable.of(false),
          keymap.of(defaultKeymap),
          EditorView.theme({
            '&': { height: '100%' },
            '.cm-scroller': { overflow: 'auto' },
          }),
        ],
      });

      view = new EditorView({ state: cmState, parent: containerRef.current! });
      viewRef.current = view;

      if (section) {
        const lineNum = findJsonLine(jsonStr, section);
        if (lineNum > 0) {
          const pos = view.state.doc.line(lineNum + 1).from;
          view.dispatch({ selection: { anchor: pos }, effects: [] });
          view.dispatch({ effects: EditorView.scrollIntoView(pos, { y: 'start' }) });
        }
      }
    };

    initEditor();

    return () => {
      if (view) {
        view.destroy();
        viewRef.current = null;
      }
    };
  }, [open, section]);

  useEffect(() => {
    if (viewRef.current && open) {
      const cur = viewRef.current.state.doc.toString();
      if (cur !== jsonStr) {
        viewRef.current.dispatch({ changes: { from: 0, to: cur.length, insert: jsonStr } });
      }
    }
  }, [jsonStr, open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const el = document.createElement('textarea');
      el.value = jsonStr;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleExport = async () => {
    const { exportJsonFile } = await import('../lib/paths');
    await exportJsonFile(jsonStr, 'settings.local.json');
  };

  const handleFormat = () => {
    if (viewRef.current) {
      try {
        const obj = JSON.parse(jsonStr);
        const formatted = JSON.stringify(obj, null, 2);
        viewRef.current.dispatch({
          changes: { from: 0, to: viewRef.current.state.doc.length, insert: formatted },
        });
      } catch { /* */ }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative ml-auto w-[55vw] min-w-[480px] max-w-[800px] h-full bg-[var(--bg-card)] flex flex-col shadow-lg border-l border-[var(--border)] animate-slide-in-right" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-page-alt)] border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--text-primary)]">{t('drawer.title')}</span>
            {section && <span className="text-[10px] text-[var(--accent)] bg-[var(--accent-bg)] px-1.5 py-0.5 rounded">{section}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="text-xs bg-[var(--text-primary)] hover:bg-[var(--text-dark)] px-3 py-1 rounded text-white transition-colors flex items-center gap-1">
              <Copy size={12} /> {copied ? t('drawer.copied') : t('drawer.copy')}
            </button>
            <button onClick={handleExport} className="text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-3 py-1 rounded text-white transition-colors flex items-center gap-1">
              <Download size={12} /> {t('drawer.export')}
            </button>
            <button onClick={handleFormat} className="text-xs border border-[var(--border)] hover:border-[var(--text-disabled)] px-3 py-1 rounded text-[var(--text-dark)] transition-colors">
              {t('drawer.format')}
            </button>
            <button onClick={onClose} className="text-xs border border-[var(--border)] hover:border-[var(--text-disabled)] px-3 py-1 rounded text-[var(--text-dark)] transition-colors flex items-center gap-1">
              <X size={12} /> {t('drawer.close')}
            </button>
          </div>
        </div>
        <div ref={containerRef} className="flex-1 overflow-hidden" />
      </div>
    </div>
  );
}
