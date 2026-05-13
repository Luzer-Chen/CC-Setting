import { useMemo } from 'react';
import { AppState, AADType } from '../lib/types';
import { TOOL_CATEGORIES } from '../lib/types';
import { AlertTriangle, Shield } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface Props {
  state: AppState;
  onOpenDrawer: (type: AADType) => void;
  onChange: (partial: Partial<AppState>) => void;
}

function getToolRulesForCategory(rules: string[], toolId: string): string[] {
  if (toolId === 'Custom') return rules;
  return rules.filter((r) => {
    if (toolId === 'Mcp') return r.startsWith('mcp__');
    if (toolId === 'Bash') return r.startsWith('Bash(') || r === 'Bash';
    if (toolId === 'Read') return r.startsWith('Read(') || r === 'Read';
    if (toolId === 'Write') return r.startsWith('Write(') || r === 'Write';
    if (toolId === 'Edit') return r.startsWith('Edit(') || r === 'Edit';
    if (toolId === 'WebFetch') return r.startsWith('WebFetch');
    if (toolId === 'WebSearch') return r.startsWith('WebSearch') || r === 'WebSearch';
    if (toolId === 'Task') return r.startsWith('Task') || r === 'Task';
    if (toolId === 'PowerShell') return r.startsWith('PowerShell') || r === 'PowerShell';
    if (toolId === 'Monitor') return r.startsWith('Monitor') || r === 'Monitor';
    if (toolId === 'Glob') return r.startsWith('Glob') || r === 'Glob';
    if (toolId === 'Grep') return r.startsWith('Grep') || r === 'Grep';
    if (toolId === 'NotebookEdit') return r.startsWith('NotebookEdit') || r === 'NotebookEdit';
    if (toolId === 'TodoWrite') return r.startsWith('TodoWrite') || r === 'TodoWrite';
    return false;
  });
}

export default function AADModule({ state, onOpenDrawer, onChange }: Props) {
  const { t } = useI18n();

  const cards = useMemo(() => {
    const types: { type: AADType; label: string; badgeBg: string; badgeText: string; btnClass: string }[] = [
      { type: 'allow', label: 'Allow', badgeBg: 'bg-[var(--success-bg)]', badgeText: 'text-[var(--success)]', btnClass: 'border-[var(--success)] text-[var(--success)] hover:bg-[var(--safe-bg)]' },
      { type: 'ask', label: 'Ask', badgeBg: 'bg-[var(--accent-bg)]', badgeText: 'text-[var(--accent)]', btnClass: 'border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-bg)]' },
      { type: 'deny', label: 'Deny', badgeBg: 'bg-[var(--danger-bg)]', badgeText: 'text-[var(--danger)]', btnClass: 'border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger-bg)]' },
    ];
    return types.map(({ type, label, badgeBg, badgeText, btnClass }) => {
      const rules = state.permissions[type];
      const hasDanger = rules.some((r) => {
        if (r === 'Bash' || r === 'Bash(*)') return true;
        if (/^(Read|Edit|Write)\(\*\)$/.test(r) || /^(Read|Edit|Write)\(\/\*\*\)$/.test(r)) return true;
        if (r === 'WebFetch' || r === 'WebSearch' || r === 'Task' || r === 'PowerShell') return true;
        return false;
      });
      const toolCounts = TOOL_CATEGORIES.filter((c) => c.id !== 'Custom').map((c) => {
        const matched = getToolRulesForCategory(rules, c.id);
        return matched.length > 0 ? `${c.label}(${matched.length})` : null;
      }).filter(Boolean);
      return { type, label, badgeBg, badgeText, btnClass, count: rules.length, hasDanger, toolCounts };
    });
  }, [state.permissions]);

  return (
    <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border)]">
      <h2 className="text-sm font-semibold mb-2 text-[var(--text-primary)]">{t('aad.title')}</h2>
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card) => {
          const isAsk = card.type === 'ask';
          const isAskDisabled = isAsk && !state.askEnabled;
          return (
            <div key={card.type} className={`rounded-lg border border-[var(--border)] p-2.5 flex flex-col bg-[var(--bg-card-alt)] ${isAskDisabled ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${card.badgeBg} ${card.badgeText}`}>{card.label}</span>
                  {isAsk && (
                    <button
                      role="switch"
                      aria-checked={state.askEnabled}
                      onClick={() => onChange({ askEnabled: !state.askEnabled })}
                      className={`relative w-7 h-[16px] rounded-full transition-colors shrink-0 ${
                        state.askEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--text-disabled)]'
                      }`}
                    >
                      <span className={`absolute top-[2px] left-[2px] w-[12px] h-[12px] rounded-full bg-white shadow transition-transform ${
                        state.askEnabled ? 'translate-x-[11px]' : 'translate-x-0'
                      }`} />
                    </button>
                  )}
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  {isAskDisabled ? t('aad.askDisabled') : `${card.count} ${t('status.items')}`}
                </span>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                {!isAskDisabled && card.hasDanger && (
                  <div className="text-[10px] text-[var(--danger)] mb-1 flex items-center gap-0.5">
                    <AlertTriangle size={10} /> {t('aad.hasDanger')}
                  </div>
                )}
                {!isAskDisabled && card.toolCounts.length > 0 && (
                  <div className="text-[10px] text-[var(--text-secondary)] mb-1.5 truncate" title={card.toolCounts.join(', ')}>
                    {card.toolCounts.slice(0, 3).join(', ')}{card.toolCounts.length > 3 ? '...' : ''}
                  </div>
                )}
                {!isAskDisabled && !card.hasDanger && card.toolCounts.length === 0 && (
                  <div className="text-[10px] text-[var(--text-disabled)] italic flex items-center gap-1">
                    <Shield size={10} /> {t('aad.empty')}{t('aad.empty.desc')}
                  </div>
                )}
              </div>
              <button
                onClick={() => onOpenDrawer(card.type)}
                disabled={isAskDisabled}
                className={`w-full text-xs py-1.5 rounded mt-auto border ${card.btnClass} transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {t('aad.enterConfig').replace('{label}', card.label)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
