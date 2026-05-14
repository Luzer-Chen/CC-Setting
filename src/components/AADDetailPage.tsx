import { useState } from 'react';
import { AppState, AADType, TOOL_CATEGORIES, ToolCategory } from '../lib/types';
import { X, ChevronUp, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { useI18n, translatePresetLabel } from '../lib/i18n';

interface Props {
  state: AppState;
  aadType: AADType;
  onChange: (partial: Partial<AppState>) => void;
  onBack: () => void;
  onOpenBashDrawer?: (type: AADType) => void;
}

function getToolRules(rules: string[], toolId: string): string[] {
  if (toolId === 'Custom') {
    const knownPrefixes = ['Bash(', 'Read(', 'Write(', 'Edit(', 'WebFetch', 'WebSearch', 'Task', 'PowerShell', 'Glob', 'Grep', 'mcp__', 'Monitor', 'NotebookEdit', 'TodoWrite', 'Bash'];
    return rules.filter((r) => !knownPrefixes.some((p) => r.startsWith(p)));
  }
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

export default function AADDetailPage({ state, aadType, onChange, onBack, onOpenBashDrawer }: Props) {
  const [expandedTool, setExpandedTool] = useState<string | null>('Bash');
  const [customInput, setCustomInput] = useState('');
  const { t } = useI18n();

  const rules = state.permissions[aadType];
  const label = aadType === 'allow' ? 'Allow' : aadType === 'ask' ? 'Ask' : 'Deny';
  const badgeBg = aadType === 'allow' ? 'bg-[var(--success-bg)]' : aadType === 'ask' ? 'bg-[var(--warning-bg)]' : 'bg-[var(--danger-bg)]';
  const badgeText = aadType === 'allow' ? 'text-[var(--success)]' : aadType === 'ask' ? 'text-[var(--warning)]' : 'text-[var(--danger)]';

  const addRule = (rule: string) => {
    if (!rule.trim()) return;
    if (rules.includes(rule.trim())) return;
    const otherTypes = (['allow', 'ask', 'deny'] as AADType[]).filter((t) => t !== aadType);
    const newPermissions = { ...state.permissions };
    for (const t of otherTypes) {
      const idx = newPermissions[t].indexOf(rule.trim());
      if (idx >= 0) {
        newPermissions[t] = [...newPermissions[t]];
        newPermissions[t].splice(idx, 1);
      }
    }
    newPermissions[aadType] = [...newPermissions[aadType], rule.trim()];
    onChange({ permissions: newPermissions });
  };

  const removeRule = (rule: string) => {
    const idx = state.permissions[aadType].indexOf(rule);
    if (idx < 0) return;
    const newList = [...state.permissions[aadType]];
    newList.splice(idx, 1);
    onChange({
      permissions: { ...state.permissions, [aadType]: newList },
    });
  };

  const moveTo = (rule: string, to: AADType) => {
    removeRule(rule);
    const targetList = [...state.permissions[to]];
    if (!targetList.includes(rule)) {
      targetList.push(rule);
    }
    onChange({
      permissions: { ...state.permissions, [to]: targetList },
    });
  };

  const isDangerous = (rule: string) => {
    if (rule === 'Bash' || rule === 'Bash(*)') return true;
    if (/^(Read|Edit|Write)\(\*\)$/.test(rule) || /^(Read|Edit|Write)\(\/\*\*\)$/.test(rule)) return true;
    if (rule === 'WebFetch' || rule === 'WebSearch' || rule === 'Task' || rule === 'PowerShell') return true;
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onBack} />
      <div className="relative w-full h-[82.65vh] bg-[var(--bg-card)] border-t border-[var(--border)] rounded-t-xl shadow-lg flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="text-xs border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-bg)] px-2.5 py-1 rounded text-[var(--text-dark)] transition-colors flex items-center gap-1">
              <X size={12} />
            </button>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${badgeBg} ${badgeText}`}>{label}</span>
            <span className="text-sm font-bold text-[var(--text-primary)]">{t('aad.toolConfig')}</span>
            <span className="text-xs text-[var(--text-muted)]">{t('aad.rulesCount').replace('{count}', String(rules.length))}</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {TOOL_CATEGORIES.map((cat) => {
            const toolRules = getToolRules(rules, cat.id);

            // Bash: fully clickable card, no expand/collapse
            if (cat.id === 'Bash') {
              return (
                <div
                  key={cat.id}
                  onClick={() => onOpenBashDrawer?.(aadType)}
                  className="bg-[var(--bg-card)] rounded-lg border border-[var(--border)] px-3 py-2.5 cursor-pointer hover:bg-[var(--accent-bg)] hover:border-[var(--accent)] transition-colors group"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenBashDrawer?.(aadType); }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{cat.label}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{t(`tool.${cat.id}.desc`)}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs text-[var(--text-secondary)]">{toolRules.length}</span>
                      <span className="text-[10px] text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
                        {t('bash.enterConfig')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // Other tools: standard expandable accordion
            const isExpanded = expandedTool === cat.id;

            return (
              <div key={cat.id} className="bg-[var(--bg-card)] rounded-lg overflow-hidden border border-[var(--border)]">
                <button
                  onClick={() => setExpandedTool(isExpanded ? null : cat.id)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--accent-bg)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{cat.label}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{t(`tool.${cat.id}.desc`)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-secondary)]">{toolRules.length}</span>
                    {isExpanded ? <ChevronUp size={14} className="text-[var(--text-disabled)]" /> : <ChevronDown size={14} className="text-[var(--text-disabled)]" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2">
                    {/* Preset rules */}
                    {cat.presetRules.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {cat.presetRules.map((preset) => {
                          const isActive = rules.includes(preset.rule);
                          return (
                            <button
                              key={preset.rule}
                              onClick={() => isActive ? removeRule(preset.rule) : addRule(preset.rule)}
                              className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors flex items-center gap-0.5 ${
                                isActive
                                  ? 'bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]'
                                  : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent)]'
                              }`}
                              title={preset.rule}
                            >
                              {isActive ? <Check size={10} /> : '+'}{translatePresetLabel(preset.label, t)}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Current rules for this tool */}
                    {toolRules.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-[var(--text-muted)]">{t('aad.currentRules')}</div>
                        {toolRules.map((rule, i) => (
                          <div key={`${rule}-${i}`} className="flex items-center gap-1 group">
                            <span className={`flex-1 text-xs px-2 py-0.5 rounded font-mono ${
                              isDangerous(rule)
                                ? 'bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger-border)]'
                                : 'bg-[var(--bg-page)] text-[var(--text-dark)] border border-[var(--border)]'
                            }`}>
                              {rule}
                            </span>
                            {(['allow', 'ask', 'deny'] as AADType[])
                              .filter((x) => x !== aadType)
                              .map((x) => (
                                <button
                                  key={x}
                                  onClick={() => moveTo(rule, x)}
                                  className="opacity-0 group-hover:opacity-100 text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent)] px-1 transition-opacity flex items-center gap-0.5"
                                  title={t('aad.moveToTarget').replace('{target}', x)}
                                >
                                  <ArrowRight size={10} />{x[0]}
                                </button>
                              ))}
                            <button
                              onClick={() => removeRule(rule)}
                              className="opacity-0 group-hover:opacity-100 text-[var(--danger)] hover:text-[var(--danger-hover)] px-1 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Custom rule input for Custom category or any category */}
                    {cat.id === 'Custom' && (
                      <div className="flex gap-1 mt-1">
                        <input
                          type="text"
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customInput.trim()) {
                              addRule(customInput);
                              setCustomInput('');
                            }
                          }}
                          placeholder={t('aad.customPlaceholder')}
                          className="flex-1 text-xs bg-[var(--bg-page)] border border-[var(--border)] rounded px-2 py-1 text-[var(--text-primary)] font-mono focus:border-[var(--accent)] outline-none transition-colors"
                        />
                        <button
                          onClick={() => {
                            if (customInput.trim()) {
                              addRule(customInput);
                              setCustomInput('');
                            }
                          }}
                          className="text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-2 py-1 rounded text-white transition-colors"
                        >
                          {t('common.add')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
