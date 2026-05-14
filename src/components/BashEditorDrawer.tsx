import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { AppState, AADType } from '../lib/types';
import { BASH_COMMAND_GROUPS, DANGEROUS_BASH_RULES, BashCommandGroup } from '../lib/bash-command-groups';
import { X, Check, ChevronUp, ChevronDown, AlertTriangle, CircleAlert } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface Props {
  state: AppState;
  aadType: AADType;
  open: boolean;
  onClose: () => void;
  onChange: (partial: Partial<AppState>) => void;
}

function wrapRule(cmd: string): string {
  const trimmed = cmd.trim();
  if (!trimmed) return '';
  if (/^Bash\s*\(/.test(trimmed)) return trimmed;
  return `Bash(${trimmed})`;
}

export default function BashEditorDrawer({ state, aadType, open, onClose, onChange }: Props) {
  const { t } = useI18n();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [customInput, setCustomInput] = useState('');
  const [customError, setCustomError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState<string>('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const manualScrollRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentRules = state.permissions[aadType];

  const bashRules = useMemo(() => {
    return currentRules.filter((r) => r.startsWith('Bash(') || r === 'Bash');
  }, [currentRules]);

  const bashRuleSet = useMemo(() => new Set(bashRules), [bashRules]);

  const allRulesSet = useMemo(() => {
    const s = new Set<string>();
    for (const r of state.permissions.allow) s.add(r);
    for (const r of state.permissions.ask) s.add(r);
    for (const r of state.permissions.deny) s.add(r);
    return s;
  }, [state.permissions]);

  const knownBashRuleSet = useMemo(() => {
    const s = new Set<string>();
    for (const g of BASH_COMMAND_GROUPS) {
      for (const c of g.commands) s.add(c.rule);
    }
    return s;
  }, []);

  const customBashRules = useMemo(() => {
    return bashRules.filter((r) => !knownBashRuleSet.has(r));
  }, [bashRules, knownBashRuleSet]);

  useEffect(() => {
    if (!open) return;
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (manualScrollRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-group-id');
            if (id) {
              setActiveNav(id);
            }
            break;
          }
        }
      },
      { root: scrollEl, rootMargin: '-20px 0px -70% 0px', threshold: 0 }
    );

    const timer = setTimeout(() => {
      for (const el of Object.values(sectionRefs.current)) {
        if (el) observer.observe(el);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      manualScrollRef.current = false;
      observer.disconnect();
    };
  }, [open, searchQuery]);

  const scrollToGroup = useCallback((id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      manualScrollRef.current = true;
      setActiveNav(id);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      scrollTimerRef.current = setTimeout(() => {
        manualScrollRef.current = false;
      }, 500);
    }
  }, []);

  const addRule = (rule: string) => {
    if (!rule.trim()) return;
    if (currentRules.includes(rule.trim())) return;
    const otherTypes = (['allow', 'ask', 'deny'] as AADType[]).filter((tt) => tt !== aadType);
    const newPermissions = { ...state.permissions };
    for (const tt of otherTypes) {
      const idx = newPermissions[tt].indexOf(rule.trim());
      if (idx >= 0) {
        newPermissions[tt] = [...newPermissions[tt]];
        newPermissions[tt].splice(idx, 1);
      }
    }
    newPermissions[aadType] = [...newPermissions[aadType], rule.trim()];
    onChange({ permissions: newPermissions });
  };

  const removeRule = (rule: string) => {
    const idx = currentRules.indexOf(rule);
    if (idx < 0) return;
    const newList = [...currentRules];
    newList.splice(idx, 1);
    onChange({
      permissions: { ...state.permissions, [aadType]: newList },
    });
  };

  const toggleRule = (rule: string) => {
    if (bashRuleSet.has(rule)) {
      removeRule(rule);
    } else {
      addRule(rule);
    }
  };

  const selectAllGroup = (group: BashCommandGroup) => {
    const newPermissions = { ...state.permissions };
    const otherTypes = (['allow', 'ask', 'deny'] as AADType[]).filter((tt) => tt !== aadType);
    const targetList = [...newPermissions[aadType]];

    for (const cmd of group.commands) {
      if (!targetList.includes(cmd.rule)) {
        targetList.push(cmd.rule);
        for (const tt of otherTypes) {
          const idx = newPermissions[tt].indexOf(cmd.rule);
          if (idx >= 0) {
            newPermissions[tt] = [...newPermissions[tt]];
            newPermissions[tt].splice(newPermissions[tt].indexOf(cmd.rule), 1);
          }
        }
      }
    }

    newPermissions[aadType] = targetList;
    onChange({ permissions: newPermissions });
  };

  const deselectAllGroup = (group: BashCommandGroup) => {
    const ruleSet = new Set(group.commands.map((c) => c.rule));
    const newList = currentRules.filter((r) => !ruleSet.has(r));
    onChange({
      permissions: { ...state.permissions, [aadType]: newList },
    });
  };

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addCustomCommand = () => {
    const rule = wrapRule(customInput);
    if (!rule) return;
    if (allRulesSet.has(rule)) {
      setCustomError(t('bash.duplicateError'));
      setTimeout(() => setCustomError(''), 2000);
      return;
    }
    addRule(rule);
    setCustomInput('');
    setCustomError('');
  };

  const isGroupAllSelected = (group: BashCommandGroup) => {
    if (group.commands.length === 0) return false;
    return group.commands.every((c) => bashRuleSet.has(c.rule));
  };

  const filteredGroups: BashCommandGroup[] = useMemo(() => {
    if (!searchQuery.trim()) return BASH_COMMAND_GROUPS.filter((g) => g.id !== 'custom');
    const q = searchQuery.toLowerCase();
    return BASH_COMMAND_GROUPS.filter((g) => g.id !== 'custom')
      .map((g) => ({
        ...g,
        commands: g.commands.filter((c) => c.label.toLowerCase().includes(q) || c.rule.toLowerCase().includes(q)),
      }))
      .filter((g) => g.commands.length > 0);
  }, [searchQuery]);

  if (!open) return null;

  const label = aadType === 'allow' ? 'Allow' : aadType === 'ask' ? 'Ask' : 'Deny';

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
            <span className="text-sm font-bold text-[var(--text-primary)]">{t('bash.title')}</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              aadType === 'allow' ? 'bg-[var(--success-bg)] text-[var(--success)]'
                : aadType === 'ask' ? 'bg-[var(--accent-bg)] text-[var(--accent)]'
                : 'bg-[var(--danger-bg)] text-[var(--danger)]'
            }`}>{label}</span>
            <span className="text-xs text-[var(--text-muted)]">{bashRules.length} {t('status.items')}</span>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-[var(--border)] shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('bash.search')}
            className="w-full text-xs bg-[var(--bg-page)] border border-[var(--border)] rounded px-3 py-1.5 text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-colors"
          />
        </div>

        {/* Body: main content + sidebar nav */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: scrollable content */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredGroups.map((group) => {
              const isExpanded = expandedGroups.has(group.id);
              const selectedInGroup = group.commands.filter((c) => bashRuleSet.has(c.rule)).length;
              const allSelected = isGroupAllSelected(group);

              return (
                <div
                  key={group.id}
                  ref={(el) => { sectionRefs.current[group.id] = el; }}
                  data-group-id={group.id}
                  className="bg-[var(--bg-card)] rounded-lg overflow-hidden border border-[var(--border)]"
                >
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[var(--accent-bg)] transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap">{group.title}</span>
                      <span className="text-[10px] text-[var(--text-muted)] truncate">{group.description}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        selectedInGroup > 0 ? 'bg-[var(--accent-bg)] text-[var(--accent)]' : 'text-[var(--text-secondary)]'
                      }`}>
                        {selectedInGroup}/{group.commands.length}
                      </span>
                      {group.commands.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            allSelected ? deselectAllGroup(group) : selectAllGroup(group);
                          }}
                          className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                            allSelected
                              ? 'bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]'
                              : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                          }`}
                        >
                          {allSelected ? t('bash.deselectAll') : t('bash.selectAll')}
                        </button>
                      )}
                      {isExpanded ? <ChevronUp size={14} className="text-[var(--text-disabled)]" /> : <ChevronDown size={14} className="text-[var(--text-disabled)]" />}
                    </div>
                  </button>

                  {isExpanded && group.commands.length > 0 && (
                    <div className="px-3 pb-3">
                      <div className="grid grid-cols-3 gap-1">
                        {group.commands.map((cmd) => {
                          const isActive = bashRuleSet.has(cmd.rule);
                          const isWide = cmd.risk === 'wide';
                          const isDanger = DANGEROUS_BASH_RULES.has(cmd.rule);
                          return (
                            <button
                              key={cmd.rule}
                              onClick={() => toggleRule(cmd.rule)}
                              className={`text-[10px] px-2 py-1 rounded font-mono transition-colors flex items-center gap-0.5 truncate ${
                                isActive
                                  ? isDanger
                                    ? 'bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger)]'
                                    : 'bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]'
                                  : isDanger
                                    ? 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--danger-border)] hover:border-[var(--danger)]'
                                    : isWide
                                      ? 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--warning)] hover:border-[var(--warning)]'
                                      : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent)]'
                              }`}
                              title={isWide ? t('bash.wideMatchHint') : cmd.rule}
                            >
                              {isActive
                                ? <Check size={10} className="shrink-0" />
                                : isDanger
                                  ? <AlertTriangle size={9} className="shrink-0" />
                                  : isWide
                                    ? <CircleAlert size={9} className="shrink-0 text-[var(--warning)]" />
                                    : '+'
                              }
                              <span className="truncate">{cmd.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Custom command section */}
            <div
              ref={(el) => { sectionRefs.current['custom'] = el; }}
              data-group-id="custom"
              className="bg-[var(--bg-card)] rounded-lg overflow-hidden border border-[var(--border)]"
            >
              <div className="px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{t('bash.customTitle')}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{t('bash.customHint')}</span>
                </div>
                {customBashRules.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-bg)] text-[var(--accent)]">
                    {customBashRules.length}
                  </span>
                )}
              </div>
              <div className="px-3 pb-3 space-y-2">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomCommand()}
                    placeholder={t('bash.customPlaceholder')}
                    className="flex-1 text-xs bg-[var(--bg-page)] border border-[var(--border)] rounded px-2 py-1 text-[var(--text-primary)] font-mono focus:border-[var(--accent)] outline-none transition-colors"
                  />
                  <button
                    onClick={addCustomCommand}
                    className="text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-2 py-1 rounded text-white transition-colors"
                  >
                    {t('common.add')}
                  </button>
                </div>
                {customError && (
                  <p className="text-[10px] text-[var(--danger)] animate-fade-in">{customError}</p>
                )}
                {customBashRules.length > 0 && (
                  <div className="space-y-1">
                    {customBashRules.map((rule, i) => {
                      const isDanger = DANGEROUS_BASH_RULES.has(rule);
                      return (
                        <div key={`${rule}-${i}`} className="flex items-center gap-1 group">
                          <span className={`flex-1 text-xs px-2 py-0.5 rounded font-mono truncate ${
                            isDanger
                              ? 'bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger-border)]'
                              : 'bg-[var(--bg-page)] text-[var(--text-dark)] border border-[var(--border)]'
                          }`}>
                            {rule}
                          </span>
                          <button
                            onClick={() => removeRule(rule)}
                            className="opacity-0 group-hover:opacity-100 text-[var(--danger)] hover:text-[var(--danger-hover)] px-1 transition-opacity shrink-0"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: floating outline navigation */}
          <div className="w-[180px] shrink-0 border-l border-[var(--border)] bg-[var(--bg-page-alt)] overflow-y-auto py-3 px-2">
            <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2 px-1">
              {t('bash.navTitle')}
            </div>
            <div className="space-y-0.5">
              {filteredGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => scrollToGroup(group.id)}
                  className={`w-full text-left text-[11px] px-2 py-1 rounded transition-colors truncate ${
                    activeNav === group.id
                      ? 'bg-[var(--accent-bg)] text-[var(--accent)] font-medium'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                  }`}
                >
                  {group.title}
                </button>
              ))}
              <button
                onClick={() => scrollToGroup('custom')}
                className={`w-full text-left text-[11px] px-2 py-1 rounded transition-colors truncate ${
                  activeNav === 'custom'
                    ? 'bg-[var(--accent-bg)] text-[var(--accent)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                {t('bash.customTitle')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
