import { DangerItem } from '../lib/types';
import { CheckCircle } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface Props {
  dangers: DangerItem[];
  open: boolean;
  onClose: () => void;
}

function DangerSection({ title, items, bgClass, borderClass, titleClass }: {
  title: string;
  items: DangerItem[];
  bgClass: string;
  borderClass: string;
  titleClass: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className={`text-xs font-semibold mb-2 ${titleClass}`}>{title} ({items.length})</h4>
      <div className="space-y-1.5">
        {items.map((d, i) => (
          <div key={i} className={`${bgClass} border ${borderClass} rounded px-3 py-2 text-xs text-[var(--text-dark)]`}>
            <div className="font-medium">{d.message}</div>
            {d.source && (
              <div className="text-[10px] text-[var(--text-muted)] mt-1">
                {d.source}
              </div>
            )}
            {d.impact && (
              <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                {d.impact}
              </div>
            )}
            {d.suggestion && (
              <div className="text-[10px] text-[var(--accent)] mt-0.5">
                {d.suggestion}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DangerReport({ dangers, open, onClose }: Props) {
  const { t } = useI18n();
  const reds = dangers.filter((d) => d.level === 'red');
  const yellows = dangers.filter((d) => d.level === 'yellow');
  const blues = dangers.filter((d) => d.level === 'blue');
  const greens = dangers.filter((d) => d.level === 'green');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-h-[70vh] bg-[var(--bg-card)] border-t border-[var(--border)] rounded-t-xl shadow-lg flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{t('danger.title')}</h3>
          <button onClick={onClose} className="text-xs border border-[var(--border)] hover:border-[var(--text-disabled)] px-3 py-1 rounded text-[var(--text-dark)] transition-colors">
            {t('common.close')}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <DangerSection
            title={t('danger.high')}
            items={reds}
            bgClass="bg-[var(--danger-bg)]"
            borderClass="border-[var(--danger-border)]"
            titleClass="text-[var(--danger)]"
          />
          <DangerSection
            title={t('danger.medium')}
            items={yellows}
            bgClass="bg-[var(--warning-bg)]"
            borderClass="border-[var(--warning-border)]"
            titleClass="text-[var(--warning)]"
          />
          <DangerSection
            title={t('danger.low')}
            items={blues}
            bgClass="bg-blue-50"
            borderClass="border-blue-200"
            titleClass="text-blue-600"
          />
          <DangerSection
            title={t('danger.safe')}
            items={greens}
            bgClass="bg-[var(--safe-bg)]"
            borderClass="border-[var(--success-border)]"
            titleClass="text-[var(--success)]"
          />
          {dangers.length === 0 && (
            <div className="text-center text-[var(--text-disabled)] text-sm py-8 flex flex-col items-center gap-2">
              <CheckCircle size={24} className="text-[var(--success)]" />
              <span>{t('danger.empty')}，{t('danger.empty.desc')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
