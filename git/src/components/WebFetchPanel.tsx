import { AppState, WebFetchMode } from '../lib/types';
import { useI18n } from '../lib/i18n';
import { Settings } from 'lucide-react';

interface Props {
  state: AppState;
  onChange: (partial: Partial<AppState>) => void;
  onOpenCustom: () => void;
}

export default function WebFetchPanel({ state, onChange, onOpenCustom }: Props) {
  const { t } = useI18n();

  const modes: { value: WebFetchMode; label: string; desc: string }[] = [
    { value: 'dev-docs', label: t('webfetch.dev-docs'), desc: t('webfetch.dev-docs.desc') },
    { value: 'all', label: t('webfetch.all'), desc: t('webfetch.all.desc') },
    { value: 'deny-all', label: t('webfetch.deny-all'), desc: t('webfetch.deny-all.desc') },
  ];
  return (
    <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border)]">
      <h2 className="text-sm font-semibold mb-2 text-[var(--text-primary)]">{t('webfetch.title')}</h2>
      <div className="space-y-1.5">
        {modes.map((m) => (
          <label key={m.value} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[var(--accent-bg)] rounded px-2 py-1 transition-colors">
            <input
              type="radio"
              name="webfetch"
              value={m.value}
              checked={state.webfetchMode === m.value}
              onChange={() => onChange({ webfetchMode: m.value })}
              className="accent-[var(--accent)]"
            />
            <div>
              <span className="text-[var(--text-primary)]">{m.label}</span>
              <span className="text-[10px] text-[var(--text-muted)] ml-2">{m.desc}</span>
            </div>
          </label>
        ))}
        {/* Custom entry */}
        <button
          onClick={onOpenCustom}
          className={`w-full flex items-center gap-2 text-sm cursor-pointer rounded px-2 py-1.5 transition-colors border ${
            state.webfetchMode === 'custom'
              ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]'
              : 'border-transparent hover:bg-[var(--accent-bg)] text-[var(--text-primary)]'
          }`}
        >
          <Settings size={13} className="shrink-0" />
          <div className="text-left">
            <div className="text-xs font-medium">{t('webfetch.customEntry')}</div>
            <div className="text-[10px] text-[var(--text-muted)]">{t('webfetch.customEntry.desc')}</div>
          </div>
        </button>
      </div>
    </div>
  );
}
