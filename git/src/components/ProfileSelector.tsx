import { AppState } from '../lib/types';
import { profiles, ProfileId } from '../lib/profiles';
import { useI18n } from '../lib/i18n';

interface Props {
  state: AppState;
  onSelect: (id: ProfileId) => void;
}

export default function ProfileSelector({ state, onSelect }: Props) {
  const { t } = useI18n();
  return (
    <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border)]">
      <h2 className="text-sm font-semibold mb-2 text-[var(--text-primary)]">{t('profile.title')}</h2>
      <div className="grid grid-cols-2 gap-2">
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`text-left p-2 rounded text-xs border transition-all ${
              state.activeProfile === p.id
                ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--text-primary)] shadow-sm'
                : 'border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-bg)]/50 bg-[var(--bg-card-alt)] text-[var(--text-primary)] hover:shadow-sm'
            }`}
          >
            <div className="font-semibold">{t(`profile.${p.id}.name`)}</div>
            <div className="text-[var(--text-muted)] mt-0.5">{t(`profile.${p.id}.desc`)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
