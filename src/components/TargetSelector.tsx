import { AppState, TargetType } from '../lib/types';
import { useI18n } from '../lib/i18n';
import { isIOS } from '../lib/platform';

interface Props {
  state: AppState;
  onChange: (partial: Partial<AppState>) => void;
}

export default function TargetSelector({ state, onChange }: Props) {
  const { t } = useI18n();
  const ios = isIOS();

  const targets: { value: TargetType; label: string }[] = ios
    ? [{ value: 'global', label: t('target.global') }]
    : [
        { value: 'global', label: t('target.global') },
        { value: 'project', label: t('target.project') },
        { value: 'local', label: t('target.local') },
      ];

  return (
    <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border)]">
      <h2 className="text-sm font-semibold mb-2 text-[var(--text-primary)]">{t('target.title')}</h2>
      <div className="space-y-1">
        {targets.map((t) => (
          <label key={t.value} className={`flex items-center gap-2 text-sm cursor-pointer rounded px-2 py-1 transition-colors ${
            state.targetType === t.value ? 'bg-[var(--accent-bg)]' : 'hover:bg-[var(--accent-bg)]'
          }`}>
            <input
              type="radio"
              name="target"
              value={t.value}
              checked={state.targetType === t.value}
              onChange={() => onChange({ targetType: t.value })}
              className="accent-[var(--accent)]"
            />
            <span className="text-[var(--text-primary)]">{t.label}</span>
          </label>
        ))}
      </div>
      {!ios && (
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={async () => {
              const { chooseProjectDirectory } = await import('../lib/paths');
              const dir = await chooseProjectDirectory();
              if (dir) onChange({ projectDir: dir });
            }}
            className="text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-2 py-1 rounded text-white transition-colors"
          >
            {t('target.chooseDir')}
          </button>
          {state.projectDir && (
            <span className="text-xs text-[var(--text-secondary)] truncate" title={state.projectDir}>{state.projectDir}</span>
          )}
        </div>
      )}
    </div>
  );
}
