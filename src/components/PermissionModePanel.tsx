import { AppState, PermissionMode } from '../lib/types';
import { useI18n } from '../lib/i18n';

interface Props {
  state: AppState;
  onChange: (partial: Partial<AppState>) => void;
}

export default function PermissionModePanel({ state, onChange }: Props) {
  const { t } = useI18n();

  const modes: { value: PermissionMode; label: string; desc: string }[] = [
    { value: 'default', label: t('permission.default'), desc: t('permission.default.desc') },
    { value: 'acceptEdits', label: t('permission.acceptEdits'), desc: t('permission.acceptEdits.desc') },
    { value: 'plan', label: t('permission.plan'), desc: t('permission.plan.desc') },
    { value: 'auto', label: t('permission.auto'), desc: t('permission.auto.desc') },
    { value: 'dontAsk', label: t('permission.dontAsk'), desc: t('permission.dontAsk.desc') },
    { value: 'bypassPermissions', label: t('permission.bypass'), desc: t('permission.bypass.desc') },
  ];
  return (
    <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border)]">
      <h2 className="text-sm font-semibold mb-3 text-[var(--text-primary)]">{t('permission.title')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {modes.map((m) => {
          const selected = state.defaultMode === m.value;
          const isDanger = m.value === 'bypassPermissions';
          return (
            <button
              key={m.value}
              onClick={() => onChange({ defaultMode: m.value })}
              className={`relative text-left rounded-lg border p-3 flex flex-col gap-1.5 transition-all ${
                selected
                  ? 'border-[var(--accent)] bg-[var(--accent-bg)] shadow-sm'
                  : 'border-[var(--border)] bg-[var(--bg-card-alt)] hover:border-[var(--accent)] hover:bg-[var(--accent-bg)]/50 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selected ? 'border-[var(--accent)]' : 'border-[var(--text-disabled)]'
                  }`}
                >
                  {selected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  )}
                </span>
                <span
                  className={`text-xs font-semibold font-mono ${
                    selected ? 'text-[var(--text-primary)]' : 'text-[var(--text-dark)]'
                  }`}
                >
                  {m.label}
                </span>
                {isDanger && (
                  <span className="text-[10px] bg-[var(--danger)] text-white px-1.5 py-0.5 rounded ml-auto whitespace-nowrap">
                    {t('status.highRisk')}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[var(--text-secondary)] leading-snug">{m.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
