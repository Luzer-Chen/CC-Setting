import { useState } from 'react';
import { AppState, WebFetchMode } from '../lib/types';
import { useI18n } from '../lib/i18n';
import { X, Plus, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { devWebFetchDomains } from '../lib/defaults';

interface Props {
  state: AppState;
  open: boolean;
  onClose: () => void;
  onChange: (partial: Partial<AppState>) => void;
}

const COMMON_SITES = [
  { name: 'GitHub', domain: 'github.com' },
  { name: 'GitHub Docs', domain: 'docs.github.com' },
  { name: 'Tauri', domain: 'tauri.app' },
  { name: 'React', domain: 'react.dev' },
  { name: 'Vite', domain: 'vite.dev' },
  { name: 'TypeScript', domain: 'typescriptlang.org' },
  { name: 'Node.js', domain: 'nodejs.org' },
  { name: 'npm', domain: 'npmjs.com' },
  { name: 'Rust Crates', domain: 'crates.io' },
  { name: 'Rust Docs', domain: 'doc.rust-lang.org' },
  { name: 'Python PyPI', domain: 'pypi.org' },
  { name: 'MDN', domain: 'developer.mozilla.org' },
];

const MODE_OPTIONS: { value: WebFetchMode; labelKey: string; descKey: string }[] = [
  { value: 'dev-docs', labelKey: 'webfetch.dev-docs', descKey: 'webfetch.dev-docs.desc' },
  { value: 'all', labelKey: 'webfetch.all', descKey: 'webfetch.all.desc' },
  { value: 'deny-all', labelKey: 'webfetch.deny-all', descKey: 'webfetch.deny-all.desc' },
  { value: 'custom', labelKey: 'webfetch.customEntry', descKey: 'webfetch.customEntry.desc' },
];

function cleanDomain(input: string): string {
  return input
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/\/$/, '')
    .trim()
    .toLowerCase();
}

export default function WebFetchCustomDrawer({ state, open, onClose, onChange }: Props) {
  const { t } = useI18n();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['mode', 'sites', 'custom']));

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!open) return null;

  const customDomains = state.webfetchCustomDomains;

  const selectMode = (mode: WebFetchMode) => {
    const updates: Partial<AppState> = { webfetchMode: mode };
    if (mode === 'dev-docs') {
      updates.webfetchCustomDomains = [...devWebFetchDomains];
    }
    onChange(updates);
  };

  const toggleSite = (domain: string) => {
    const exists = customDomains.includes(domain);
    const next = exists
      ? customDomains.filter((d) => d !== domain)
      : [...customDomains, domain];
    onChange({ webfetchCustomDomains: next, webfetchMode: 'custom' });
  };

  const addAllSites = () => {
    const newDomains = [...new Set([...customDomains, ...COMMON_SITES.map((s) => s.domain)])];
    onChange({ webfetchCustomDomains: newDomains, webfetchMode: 'custom' });
  };

  const addCustomDomain = () => {
    const cleaned = cleanDomain(inputValue);
    if (!cleaned) {
      setError(t('webcustom.emptyError'));
      setTimeout(() => setError(''), 2000);
      return;
    }
    if (!/^[a-z0-9]([a-z0-9-]*\.)*[a-z0-9-]+\.[a-z]{2,}$/i.test(cleaned)) {
      setError(t('webcustom.invalidDomain'));
      setTimeout(() => setError(''), 2000);
      return;
    }
    if (customDomains.includes(cleaned)) {
      setError(t('webcustom.duplicate'));
      setTimeout(() => setError(''), 2000);
      return;
    }
    onChange({ webfetchCustomDomains: [...customDomains, cleaned], webfetchMode: 'custom' });
    setInputValue('');
    setError('');
  };

  const removeDomain = (domain: string) => {
    onChange({ webfetchCustomDomains: customDomains.filter((d) => d !== domain) });
  };

  const allCount = customDomains.length;
  const allSitesSelected = COMMON_SITES.every((s) => customDomains.includes(s.domain));

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
            <span className="text-sm font-bold text-[var(--text-primary)]">{t('webfetch.customDrawer.title')}</span>
            <span className="text-xs text-[var(--text-muted)]">{allCount} {t('status.items')}</span>
          </div>
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
                <span className="text-sm font-semibold text-[var(--text-primary)]">{t('webfetch.customDrawer.modeSection')}</span>
                <span className="text-[10px] text-[var(--text-muted)]">{t('webfetch.customDrawer.modeDesc')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)]">{state.webfetchMode}</span>
                {expandedSections.has('mode') ? <ChevronUp size={14} className="text-[var(--text-disabled)]" /> : <ChevronDown size={14} className="text-[var(--text-disabled)]" />}
              </div>
            </button>
            {expandedSections.has('mode') && (
              <div className="px-3 pb-3">
                <div className="flex flex-wrap gap-1">
                  {MODE_OPTIONS.map((m) => {
                    const isActive = state.webfetchMode === m.value;
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

          {/* Section 2: Common dev websites */}
          <div className="bg-[var(--bg-card)] rounded-lg overflow-hidden border border-[var(--border)]">
            <button
              onClick={() => toggleSection('sites')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--accent-bg)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">{t('webcustom.commonSites')}</span>
                <span className="text-[10px] text-[var(--text-muted)]">{t('webfetch.customDrawer.sitesDesc')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)]">
                  {COMMON_SITES.filter((s) => customDomains.includes(s.domain)).length}/{COMMON_SITES.length}
                </span>
                {expandedSections.has('sites') ? <ChevronUp size={14} className="text-[var(--text-disabled)]" /> : <ChevronDown size={14} className="text-[var(--text-disabled)]" />}
              </div>
            </button>
            {expandedSections.has('sites') && (
              <div className="px-3 pb-3">
                <div className="flex flex-wrap gap-1">
                  {!allSitesSelected && (
                    <button
                      onClick={addAllSites}
                      className="text-[10px] px-2 py-0.5 rounded font-mono transition-colors flex items-center gap-0.5 bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)] border-dashed"
                    >
                      <Plus size={10} /> {t('webcustom.addAll')}
                    </button>
                  )}
                  {COMMON_SITES.map((site) => {
                    const isActive = customDomains.includes(site.domain);
                    return (
                      <button
                        key={site.domain}
                        onClick={() => toggleSite(site.domain)}
                        className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors flex items-center gap-0.5 ${
                          isActive
                            ? 'bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]'
                            : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent)]'
                        }`}
                        title={site.domain}
                      >
                        {isActive ? <Check size={10} /> : '+'}{site.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Custom domains */}
          <div className="bg-[var(--bg-card)] rounded-lg overflow-hidden border border-[var(--border)]">
            <button
              onClick={() => toggleSection('custom')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--accent-bg)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">{t('webcustom.customDomain')}</span>
                <span className="text-[10px] text-[var(--text-muted)]">{t('webfetch.customDrawer.customDesc')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)]">{customDomains.length}</span>
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
                    onKeyDown={(e) => e.key === 'Enter' && addCustomDomain()}
                    placeholder={t('webcustom.placeholder')}
                    className="flex-1 text-xs bg-[var(--bg-page)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-colors"
                  />
                  <button
                    onClick={addCustomDomain}
                    className="text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-3 py-2 rounded text-white transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Plus size={12} /> {t('webcustom.add')}
                  </button>
                </div>
                {error && (
                  <p className="text-[10px] text-[var(--danger)] animate-fade-in">{error}</p>
                )}
                {customDomains.length > 0 && (
                  <div className="space-y-1">
                    {customDomains.map((domain) => (
                      <div key={domain} className="flex items-center justify-between px-2 py-1 bg-[var(--bg-page)] border border-[var(--border)] rounded text-xs group">
                        <span className="text-[var(--text-dark)] font-mono">{domain}</span>
                        <button
                          onClick={() => removeDomain(domain)}
                          className="opacity-0 group-hover:opacity-100 text-[var(--text-disabled)] hover:text-[var(--danger)] transition-all"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {customDomains.length === 0 && (
                  <div className="text-center text-[var(--text-disabled)] text-[10px] py-2">
                    {t('webcustom.empty')}
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
