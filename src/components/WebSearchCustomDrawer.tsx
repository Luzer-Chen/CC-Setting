import { useState } from 'react';
import { AppState, WebSearchMode } from '../lib/types';
import { useI18n } from '../lib/i18n';
import { X, Plus, Check, ChevronUp, ChevronDown, Info } from 'lucide-react';

interface Props {
  state: AppState;
  open: boolean;
  onClose: () => void;
  onChange: (partial: Partial<AppState>) => void;
}

const SEARCH_PREFERENCES = [
  'GitHub', 'Tauri', 'React', 'Vite', 'TypeScript',
  'Node.js', 'npm', 'Rust', 'Python', 'MDN',
];

const MODE_OPTIONS: { value: WebSearchMode; labelKey: string; descKey: string }[] = [
  { value: 'allow', labelKey: 'websearch.allow', descKey: 'websearch.allow.desc' },
  { value: 'ask', labelKey: 'websearch.ask', descKey: 'websearch.ask.desc' },
  { value: 'deny', labelKey: 'websearch.deny', descKey: 'websearch.deny.desc' },
];

export default function WebSearchCustomDrawer({ state, open, onClose, onChange }: Props) {
  const { t } = useI18n();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['mode', 'prefs', 'custom']));

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!open) return null;

  const selectMode = (mode: WebSearchMode) => {
    onChange({ websearchMode: mode });
  };

  const togglePreference = (name: string) => {
    setPreferences((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const addPreference = () => {
    const cleaned = inputValue.trim();
    if (!cleaned) {
      setError(t('websearch.customDrawer.emptyError'));
      setTimeout(() => setError(''), 2000);
      return;
    }
    if (preferences.includes(cleaned)) {
      setError(t('websearch.customDrawer.duplicate'));
      setTimeout(() => setError(''), 2000);
      return;
    }
    setPreferences([...preferences, cleaned]);
    setInputValue('');
    setError('');
  };

  const removePreference = (name: string) => {
    setPreferences(preferences.filter((p) => p !== name));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative w-full h-[82.65vh] bg-[var(--bg-card)] border-t border-[var(--border)] rounded-t-xl shadow-lg flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-xs border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-bg)] px-2.5 py-1 rounded text-[var(--text-dark)] transition-colors flex items-center gap-1">
              <X size={12} />
            </button>
            <span className="text-sm font-bold text-[var(--text-primary)]">{t('websearch.customDrawer.title')}</span>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-2 px-4 py-2 bg-[var(--accent-bg)] border-b border-[var(--border)] text-[10px] text-[var(--text-secondary)]">
          <Info size={12} className="shrink-0 mt-0.5" />
          <span>{t('websearch.customDrawer.info')}</span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {/* Section 1: Mode selection */}
          <div className="bg-[var(--bg-card)] rounded-lg overflow-hidden border border-[var(--border)]">
            <button
              onClick={() => toggleSection('mode')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--accent-bg)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">{t('websearch.customDrawer.modeSection')}</span>
                <span className="text-[10px] text-[var(--text-muted)]">{t('websearch.customDrawer.modeDesc')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)]">{state.websearchMode}</span>
                {expandedSections.has('mode') ? <ChevronUp size={14} className="text-[var(--text-disabled)]" /> : <ChevronDown size={14} className="text-[var(--text-disabled)]" />}
              </div>
            </button>
            {expandedSections.has('mode') && (
              <div className="px-3 pb-3">
                <div className="flex flex-wrap gap-1">
                  {MODE_OPTIONS.map((m) => {
                    const isActive = state.websearchMode === m.value;
                    return (
                      <button
                        key={m.value}
                        onClick={() => selectMode(m.value)}
                        className={`text-[10px] px-2 py-0.5 rounded transition-colors flex items-center gap-0.5 ${
                          isActive
                            ? 'bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]'
                            : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent)]'
                        }`}
                      >
                        {isActive ? <Check size={10} /> : '+'}{t(m.labelKey)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Search preferences */}
          <div className="bg-[var(--bg-card)] rounded-lg overflow-hidden border border-[var(--border)]">
            <button
              onClick={() => toggleSection('prefs')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--accent-bg)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">{t('websearch.customDrawer.preferences')}</span>
                <span className="text-[10px] text-[var(--text-muted)]">{t('websearch.customDrawer.prefsDesc')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)]">{preferences.length}/{SEARCH_PREFERENCES.length}</span>
                {expandedSections.has('prefs') ? <ChevronUp size={14} className="text-[var(--text-disabled)]" /> : <ChevronDown size={14} className="text-[var(--text-disabled)]" />}
              </div>
            </button>
            {expandedSections.has('prefs') && (
              <div className="px-3 pb-3">
                <div className="flex flex-wrap gap-1">
                  {SEARCH_PREFERENCES.map((name) => {
                    const isActive = preferences.includes(name);
                    return (
                      <button
                        key={name}
                        onClick={() => togglePreference(name)}
                        className={`text-[10px] px-2 py-0.5 rounded transition-colors flex items-center gap-0.5 ${
                          isActive
                            ? 'bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]'
                            : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent)]'
                        }`}
                      >
                        {isActive ? <Check size={10} /> : '+'}{name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Custom preferences */}
          <div className="bg-[var(--bg-card)] rounded-lg overflow-hidden border border-[var(--border)]">
            <button
              onClick={() => toggleSection('custom')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--accent-bg)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">{t('websearch.customDrawer.customPref')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)]">{preferences.length}</span>
                {expandedSections.has('custom') ? <ChevronUp size={14} className="text-[var(--text-disabled)]" /> : <ChevronDown size={14} className="text-[var(--text-disabled)]" />}
              </div>
            </button>
            {expandedSections.has('custom') && (
              <div className="px-3 pb-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addPreference()}
                    placeholder={t('websearch.customDrawer.placeholder')}
                    className="flex-1 text-xs bg-[var(--bg-page)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-colors"
                  />
                  <button
                    onClick={addPreference}
                    className="text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-3 py-2 rounded text-white transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Plus size={12} /> {t('websearch.customDrawer.add')}
                  </button>
                </div>
                {error && (
                  <p className="text-[10px] text-[var(--danger)] animate-fade-in">{error}</p>
                )}
                {preferences.length > 0 && (
                  <div className="space-y-1">
                    {preferences.map((pref) => (
                      <div key={pref} className="flex items-center justify-between px-2 py-1 bg-[var(--bg-page)] border border-[var(--border)] rounded text-xs group">
                        <span className="text-[var(--text-dark)]">{pref}</span>
                        <button
                          onClick={() => removePreference(pref)}
                          className="opacity-0 group-hover:opacity-100 text-[var(--text-disabled)] hover:text-[var(--danger)] transition-all"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {preferences.length === 0 && (
                  <div className="text-center text-[var(--text-disabled)] text-[10px] py-2">
                    {t('websearch.customDrawer.emptyPrefs')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
