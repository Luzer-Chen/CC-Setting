import { AppState, WebSearchMode } from '../lib/types';
import { useI18n } from '../lib/i18n';
import { Settings } from 'lucide-react';

interface Props {
  state: AppState;
  onChange: (partial: Partial<AppState>) => void;
  onOpenCustom: () => void;
}

export default function WebSearchPanel({ state, onChange, onOpenCustom }: Props) {
  const { t } = useI18n();

  const modes: { value: WebSearchMode; label: string; desc: string }[] = [
    { value: 'allow', label: t('websearch.allow'), desc: t('websearch.allow.desc') },
    { value: 'ask', label: t('websearch.ask'), desc: t('websearch.ask.desc') },
    { value: 'deny', label: t('websearch.deny'), desc: t('websearch.deny.desc') },
  ];
  return (
    <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border)]">
      <h2 className="text-sm font-semibold mb-2 text-[var(--text-primary)]">{t('websearch.title')}</h2>
      <div className="space-y-1.5">
        {modes.map((m) => (
          <label key={m.value} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[var(--accent-bg)] rounded px-2 py-1 transition-colors">
            <input
              type="radio"
              name="websearch"
              value={m.value}
              checked={state.websearchMode === m.value}
              onChange={() => onChange({ websearchMode: m.value })}
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
          className="w-full flex items-center gap-2 text-sm cursor-pointer rounded px-2 py-1.5 transition-colors border border-transparent hover:bg-[var(--accent-bg)] text-[var(--text-primary)]"
        >
          <Settings size={13} className="shrink-0" />
          <div className="text-left">
            <div className="text-xs font-medium">{t('websearch.customEntry')}</div>
            <div className="text-[10px] text-[var(--text-muted)]">{t('websearch.customEntry.desc')}</div>
          </div>
        </button>
      </div>
    </div>
  );
}
