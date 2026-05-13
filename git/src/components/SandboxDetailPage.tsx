import { useState } from 'react';
import { AppState, NetworkMode } from '../lib/types';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface Props {
  state: AppState;
  onChange: (partial: Partial<AppState>) => void;
  onBack: () => void;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[var(--accent-bg)] rounded px-2 py-1 transition-colors">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-8 h-[18px] rounded-full transition-colors shrink-0 ${
          checked ? 'bg-[var(--accent)]' : 'bg-[var(--text-disabled)]'
        }`}
      >
        <span className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[14px]' : 'translate-x-0'
        }`} />
      </button>
      <span className="text-[var(--text-primary)]">{label}</span>
    </label>
  );
}

export default function SandboxDetailPage({ state, onChange, onBack }: Props) {
  const { t } = useI18n();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['core']));

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const networkModes: { value: NetworkMode; label: string }[] = [
    { value: 'disabled', label: t('sandbox.netDisable') },
    { value: 'dev-domains', label: t('sandbox.netDevDocs') },
    { value: 'open', label: t('sandbox.netOpen') },
  ];

  const updateSandbox = (key: string, value: boolean | string[]) => {
    onChange({
      sandbox: { ...state.sandbox, [key]: value },
    });
  };

  const updateFs = (key: string, value: string) => {
    const items = value.split('\n').filter((s) => s.trim());
    onChange({
      filesystem: { ...state.filesystem, [key]: items },
    });
  };

  const updateNet = (key: string, value: boolean) => {
    onChange({
      network: { ...state.network, [key]: value },
    });
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
            <span className="text-sm font-bold text-[var(--text-primary)]">{t('sandbox.title')}</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {/* Section 1: Core sandbox switches */}
          <div className="bg-[var(--bg-card)] rounded-lg overflow-hidden border border-[var(--border)]">
            <button
              onClick={() => toggleSection('core')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--accent-bg)] transition-colors"
            >
              <span className="text-sm font-semibold text-[var(--text-primary)]">{t('sandbox.coreSwitches')}</span>
              {expandedSections.has('core') ? <ChevronUp size={14} className="text-[var(--text-disabled)]" /> : <ChevronDown size={14} className="text-[var(--text-disabled)]" />}
            </button>
            {expandedSections.has('core') && (
              <div className="px-3 pb-3 space-y-1">
                {[
                  { key: 'enabled', label: t('sandbox.enable') },
                  { key: 'failIfUnavailable', label: t('sandbox.failIfUnavailable') },
                  { key: 'autoAllowBashIfSandboxed', label: t('sandbox.autoAllowBash') },
                  { key: 'allowUnsandboxedCommands', label: t('sandbox.allowUnsandboxed') },
                  { key: 'enableWeakerNestedSandbox', label: t('sandbox.weakNested') },
                  { key: 'enableWeakerNetworkIsolation', label: t('sandbox.weakNetwork') },
                ].map(({ key, label }) => (
                  <Toggle
                    key={key}
                    checked={(state.sandbox as any)[key]}
                    onChange={(v) => updateSandbox(key, v)}
                    label={label}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section 2: excludedCommands */}
          <div className="bg-[var(--bg-card)] rounded-lg overflow-hidden border border-[var(--border)]">
            <button
              onClick={() => toggleSection('excluded')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--accent-bg)] transition-colors"
            >
              <span className="text-sm font-semibold text-[var(--text-primary)]">{t('sandbox.excludedCommands')}</span>
              {expandedSections.has('excluded') ? <ChevronUp size={14} className="text-[var(--text-disabled)]" /> : <ChevronDown size={14} className="text-[var(--text-disabled)]" />}
            </button>
            {expandedSections.has('excluded') && (
              <div className="px-3 pb-3">
                <textarea
                  value={state.sandbox.excludedCommands.join('\n')}
                  onChange={(e) => updateSandbox('excludedCommands', e.target.value.split('\n').filter((s) => s.trim()))}
                  placeholder={t('sandbox.excludedPlaceholder')}
                  className="w-full text-xs bg-[var(--bg-page)] border border-[var(--border)] rounded px-2 py-1 text-[var(--text-primary)] h-20 resize-none font-mono focus:border-[var(--accent)] outline-none transition-colors"
                />
              </div>
            )}
          </div>

          {/* Section 3: Filesystem */}
          <div className="bg-[var(--bg-card)] rounded-lg overflow-hidden border border-[var(--border)]">
            <button
              onClick={() => toggleSection('filesystem')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--accent-bg)] transition-colors"
            >
              <span className="text-sm font-semibold text-[var(--text-primary)]">Filesystem</span>
              {expandedSections.has('filesystem') ? <ChevronUp size={14} className="text-[var(--text-disabled)]" /> : <ChevronDown size={14} className="text-[var(--text-disabled)]" />}
            </button>
            {expandedSections.has('filesystem') && (
              <div className="px-3 pb-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'allowRead', label: 'allowRead', badgeBg: 'bg-[var(--success-bg)]', badgeText: 'text-[var(--success)]' },
                    { key: 'allowWrite', label: 'allowWrite', badgeBg: 'bg-[var(--success-bg)]', badgeText: 'text-[var(--success)]' },
                    { key: 'denyRead', label: 'denyRead', badgeBg: 'bg-[var(--danger-bg)]', badgeText: 'text-[var(--danger)]' },
                    { key: 'denyWrite', label: 'denyWrite', badgeBg: 'bg-[var(--danger-bg)]', badgeText: 'text-[var(--danger)]' },
                  ].map(({ key, label, badgeBg, badgeText }) => (
                    <div key={key}>
                      <label className={`text-xs font-medium px-1.5 py-0.5 rounded ${badgeBg} ${badgeText}`}>{label}</label>
                      <textarea
                        value={(state.filesystem[key as keyof typeof state.filesystem] as string[]).join('\n')}
                        onChange={(e) => updateFs(key, e.target.value)}
                        className="w-full text-xs bg-[var(--bg-page)] border border-[var(--border)] rounded px-2 py-1 text-[var(--text-primary)] h-24 resize-none mt-0.5 font-mono focus:border-[var(--accent)] outline-none transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Network */}
          <div className="bg-[var(--bg-card)] rounded-lg overflow-hidden border border-[var(--border)]">
            <button
              onClick={() => toggleSection('network')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--accent-bg)] transition-colors"
            >
              <span className="text-sm font-semibold text-[var(--text-primary)]">{t('sandbox.networkSection')}</span>
              {expandedSections.has('network') ? <ChevronUp size={14} className="text-[var(--text-disabled)]" /> : <ChevronDown size={14} className="text-[var(--text-disabled)]" />}
            </button>
            {expandedSections.has('network') && (
              <div className="px-3 pb-3">
                <div className="space-y-1 mb-3">
                  {networkModes.map((m) => (
                    <label key={m.value} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[var(--accent-bg)] rounded px-2 py-1 transition-colors">
                      <input
                        type="radio"
                        name="network-mode"
                        value={m.value}
                        checked={state.networkMode === m.value}
                        onChange={() => onChange({ networkMode: m.value })}
                        className="accent-[var(--accent)]"
                      />
                      <span className="text-[var(--text-primary)]">{m.label}</span>
                    </label>
                  ))}
                </div>
                <div className="space-y-1">
                  <Toggle
                    checked={state.network.allowLocalBinding}
                    onChange={(v) => updateNet('allowLocalBinding', v)}
                    label={t('sandbox.allowLocalBinding')}
                  />
                  <Toggle
                    checked={state.network.allowAllUnixSockets}
                    onChange={(v) => updateNet('allowAllUnixSockets', v)}
                    label={t('sandbox.allowUnixSockets')}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
