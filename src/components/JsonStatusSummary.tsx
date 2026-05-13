import { useMemo } from 'react';
import { AppState } from '../lib/types';
import LanguageSwitcher from './LanguageSwitcher';
import { useI18n } from '../lib/i18n';

interface Props {
  jsonStr: string;
  state: AppState;
  onOpenDrawer: (section?: string) => void;
}

export default function JsonStatusSummary({ jsonStr, state, onOpenDrawer }: Props) {
  const { t } = useI18n();
  const summary = useMemo(() => {
    const obj = JSON.parse(jsonStr);
    const perms = obj.permissions || {};
    const sandbox = obj.sandbox || {};
    const fs = sandbox.filesystem || {};
    const net = sandbox.network || {};
    return {
      mode: perms.defaultMode || 'default',
      allowCount: (perms.allow || []).length,
      askCount: (perms.ask || []).length,
      denyCount: (perms.deny || []).length,
      sandboxOn: !!sandbox.enabled,
      netMode: (net.allowedDomains || []).includes('*')
        ? t('status.open')
        : (net.allowedDomains || []).length === 0
        ? t('status.blocked')
        : t('json.domains').replace('{count}', String((net.allowedDomains || []).length)),
      fsAllow: (fs.allowRead || []).length + (fs.allowWrite || []).length,
      fsDeny: (fs.denyRead || []).length + (fs.denyWrite || []).length,
      jsonSize: new Blob([jsonStr]).size,
    };
  }, [jsonStr]);

  return (
    <div className="pl-3 pr-6 py-2">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{t('json.title')}</h2>
          <span className="text-[10px] text-[var(--text-disabled)]">{summary.jsonSize} {t('status.bytes')}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => onOpenDrawer()}
            className="text-xs bg-[var(--text-primary)] hover:bg-[var(--text-dark)] px-3 py-1 rounded text-white transition-colors"
          >
            {t('json.view')}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-x-6 gap-y-1 text-xs">
        <button onClick={() => onOpenDrawer('permissions')} className="flex justify-between hover:bg-[var(--accent-bg)] px-1 rounded text-left transition-colors">
          <span className="text-[var(--text-secondary)]">{t('json.defaultMode')}</span>
          <span className="text-[var(--text-primary)] font-mono">{summary.mode}</span>
        </button>
        <button onClick={() => onOpenDrawer('sandbox')} className="flex justify-between hover:bg-[var(--accent-bg)] px-1 rounded text-left transition-colors">
          <span className="text-[var(--text-secondary)]">{t('json.sandbox')}</span>
          <span className={summary.sandboxOn ? 'text-[var(--success)]' : 'text-[var(--danger)]'}>{summary.sandboxOn ? t('status.enabled') : t('status.disabled')}</span>
        </button>
        <button onClick={() => onOpenDrawer('permissions.allow')} className="flex justify-between hover:bg-[var(--accent-bg)] px-1 rounded text-left transition-colors">
          <span className="text-[var(--text-secondary)]">{t('json.allow')}</span>
          <span className="text-[var(--success)]">{summary.allowCount}</span>
        </button>
        <button onClick={() => onOpenDrawer('permissions.ask')} className="flex justify-between hover:bg-[var(--accent-bg)] px-1 rounded text-left transition-colors">
          <span className="text-[var(--text-secondary)]">{t('json.ask')}</span>
          <span className="text-[var(--warning)]">{summary.askCount}</span>
        </button>
        <button onClick={() => onOpenDrawer('permissions.deny')} className="flex justify-between hover:bg-[var(--accent-bg)] px-1 rounded text-left transition-colors">
          <span className="text-[var(--text-secondary)]">{t('json.deny')}</span>
          <span className="text-[var(--danger)]">{summary.denyCount}</span>
        </button>
        <button onClick={() => onOpenDrawer('sandbox.network')} className="flex justify-between hover:bg-[var(--accent-bg)] px-1 rounded text-left transition-colors">
          <span className="text-[var(--text-secondary)]">{t('json.network')}</span>
          <span className={summary.netMode === t('status.open') ? 'text-[var(--warning)]' : summary.netMode === t('status.blocked') ? 'text-[var(--success)]' : 'text-[var(--accent)]'}>{summary.netMode}</span>
        </button>
        <button onClick={() => onOpenDrawer('sandbox.filesystem')} className="flex justify-between hover:bg-[var(--accent-bg)] px-1 rounded text-left transition-colors">
          <span className="text-[var(--text-secondary)]">{t('json.fs.allow')}</span>
          <span className="text-[var(--success)]">{summary.fsAllow}</span>
        </button>
        <button onClick={() => onOpenDrawer('sandbox.filesystem')} className="flex justify-between hover:bg-[var(--accent-bg)] px-1 rounded text-left transition-colors">
          <span className="text-[var(--text-secondary)]">{t('json.fs.deny')}</span>
          <span className="text-[var(--danger)]">{summary.fsDeny}</span>
        </button>
      </div>
    </div>
  );
}
