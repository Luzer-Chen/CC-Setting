import { useState, useMemo, useCallback, useRef } from 'react';
import { AppState, AADType } from './lib/types';
import { createDefaultState } from './lib/defaults';
import { applyProfile, ProfileId } from './lib/profiles';
import { generateSettingsJson } from './lib/generator';
import { scanDangerousConfig } from './lib/danger-check';
import { formatJson } from './lib/format';

import TargetSelector from './components/TargetSelector';
import ProfileSelector from './components/ProfileSelector';
import PermissionModePanel from './components/PermissionModePanel';
import WebFetchPanel from './components/WebFetchPanel';
import WebSearchPanel from './components/WebSearchPanel';
import WebFetchCustomDrawer from './components/WebFetchCustomDrawer';
import WebSearchCustomDrawer from './components/WebSearchCustomDrawer';
import JsonStatusSummary from './components/JsonStatusSummary';
import JsonDrawer from './components/JsonDrawer';
import AADModule from './components/AADModule';
import AADDetailPage from './components/AADDetailPage';
import SandboxDetailPage from './components/SandboxDetailPage';
import DangerReport from './components/DangerReport';
import ActionBar from './components/ActionBar';
import UpdateChecker from './components/UpdateChecker';
import { useI18n } from './lib/i18n';

function App() {
  const [state, setState] = useState<AppState>(createDefaultState);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSection, setDrawerSection] = useState<string | undefined>();
  const [riskSheetOpen, setRiskSheetOpen] = useState(false);
  const [webfetchCustomOpen, setWebfetchCustomOpen] = useState(false);
  const [websearchCustomOpen, setWebsearchCustomOpen] = useState(false);
  const [aadDrawerOpen, setAadDrawerOpen] = useState(false);
  const [aadDrawerType, setAadDrawerType] = useState<AADType>('allow');
  const [sandboxDrawerOpen, setSandboxDrawerOpen] = useState(false);
  const { t } = useI18n();

  // Prevents auto-switch to 'custom' during profile application
  const isApplyingProfile = useRef(false);

  const jsonOutput = useMemo(() => {
    const obj = generateSettingsJson(state);
    return formatJson(obj);
  }, [state]);

  const dangers = useMemo(() => scanDangerousConfig(state, t), [state, t]);

  // Unified state updater: auto-switches to 'custom' when user manually changes config
  const updateState = useCallback((partial: Partial<AppState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      // Only auto-switch to 'custom' for user-driven config changes, not profile applications
      if (!isApplyingProfile.current && prev.activeProfile && prev.activeProfile !== 'custom') {
        const prevStr = JSON.stringify(prev);
        const nextStr = JSON.stringify(next);
        if (prevStr !== nextStr) {
          next.activeProfile = 'custom';
        }
      }
      return next;
    });
  }, []);

  // Single entry point for profile selection
  const handleProfileSelect = useCallback((profileId: ProfileId) => {
    isApplyingProfile.current = true;
    setState((prev) => {
      const next = applyProfile(prev, profileId);
      // Reset guard after this state update is computed, using rAF to survive batching
      requestAnimationFrame(() => {
        isApplyingProfile.current = false;
      });
      return next;
    });
  }, []);

  const openDrawer = useCallback((section?: string) => {
    setDrawerSection(section);
    setDrawerOpen(true);
  }, []);

  // Sandbox summary
  const sandboxSummary = useMemo(() => {
    const s = state.sandbox;
    const fs = state.filesystem;
    return {
      enabled: s.enabled,
      fsAllow: fs.allowRead.length + fs.allowWrite.length,
      fsDeny: fs.denyRead.length + fs.denyWrite.length,
      netMode: state.networkMode,
      excludedCount: s.excludedCommands.length,
    };
  }, [state.sandbox, state.filesystem, state.networkMode]);

  // Main page
  return (
    <div className="h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)]">
      {/* Top brand area: logo + header + JSON summary */}
      <div className="shrink-0 sticky top-0 z-30 bg-[var(--bg-page-alt)] border-b border-[var(--border)]">
        <div className="grid" style={{ gridTemplateColumns: '100px 1fr' }}>
          {/* Left: Logo, fills entire cell */}
          <div className="flex items-stretch">
            <img src="/app-icon.png" alt="cc-setting" className="w-full h-full object-contain p-1" style={{ transform: 'scale(1.5)' }} />
          </div>

          {/* Right: Header title + JSON summary */}
          <div>
            {/* Title row */}
            <div className="flex items-center pl-3 pr-6 py-2.5 border-b border-[var(--border)]">
              <h1 className="text-lg font-bold text-[var(--text-primary)]">{t('app.title')}</h1>
              <span className="ml-3 text-xs text-[var(--text-secondary)]">{t('app.subtitle')}</span>
            </div>

            {/* JSON summary */}
            <JsonStatusSummary jsonStr={jsonOutput} state={state} onOpenDrawer={openDrawer} />
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 pb-20 space-y-4 max-w-[960px] mx-auto">
          <TargetSelector state={state} onChange={updateState} />
          <ProfileSelector state={state} onSelect={handleProfileSelect} />
          <PermissionModePanel state={state} onChange={updateState} />
          <AADModule state={state} onOpenDrawer={(type) => { setAadDrawerType(type); setAadDrawerOpen(true); }} onChange={updateState} />

          {/* Sandbox summary */}
          <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">{t('sandbox.title')}</h2>
              <button
                onClick={() => setSandboxDrawerOpen(true)}
                className="text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-3 py-1 rounded text-white transition-colors"
              >
                {t('sandbox.enterConfig')}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">{t('json.sandbox')}</span>
                <span className={sandboxSummary.enabled ? 'text-[var(--success)]' : 'text-[var(--danger)]'}>
                  {sandboxSummary.enabled ? t('status.enabled') : t('status.disabled')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">{t('sandbox.network')}</span>
                <span className={sandboxSummary.netMode === 'open' ? 'text-[var(--warning)]' : sandboxSummary.netMode === 'disabled' ? 'text-[var(--success)]' : 'text-[var(--accent)]'}>
                  {sandboxSummary.netMode === 'open' ? t('status.open') : sandboxSummary.netMode === 'disabled' ? t('status.blocked') : t('status.whitelist')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">{t('sandbox.fs.allow')}</span>
                <span className="text-[var(--success)]">{sandboxSummary.fsAllow} {t('status.items')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">{t('sandbox.fs.deny')}</span>
                <span className="text-[var(--danger)]">{sandboxSummary.fsDeny} {t('status.items')}</span>
              </div>
              {sandboxSummary.excludedCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">{t('status.excluded')}</span>
                  <span className="text-[var(--warning)]">{sandboxSummary.excludedCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* WebFetch + WebSearch side by side */}
          <div className="grid grid-cols-2 gap-4">
            <WebFetchPanel state={state} onChange={updateState} onOpenCustom={() => setWebfetchCustomOpen(true)} />
            <WebSearchPanel state={state} onChange={updateState} onOpenCustom={() => setWebsearchCustomOpen(true)} />
          </div>
        </div>
      </div>

      {/* Unified bottom bar: score + risk entries + actions */}
      <ActionBar
        state={state}
        jsonOutput={jsonOutput}
        dangers={dangers}
        onOpenRiskSheet={() => setRiskSheetOpen(true)}
        onChange={updateState}
      />

      {/* Risk detail bottom sheet */}
      <DangerReport
        dangers={dangers}
        open={riskSheetOpen}
        onClose={() => setRiskSheetOpen(false)}
      />

      {/* JSON Drawer */}
      <JsonDrawer
        jsonStr={jsonOutput}
        open={drawerOpen}
        section={drawerSection}
        onClose={() => setDrawerOpen(false)}
      />

      {/* WebFetch Custom Drawer */}
      <WebFetchCustomDrawer
        state={state}
        open={webfetchCustomOpen}
        onClose={() => setWebfetchCustomOpen(false)}
        onChange={updateState}
      />

      {/* WebSearch Custom Drawer */}
      <WebSearchCustomDrawer
        state={state}
        open={websearchCustomOpen}
        onClose={() => setWebsearchCustomOpen(false)}
        onChange={updateState}
      />

      {/* AAD Detail Drawer */}
      {aadDrawerOpen && (
        <AADDetailPage
          state={state}
          aadType={aadDrawerType}
          onChange={updateState}
          onBack={() => setAadDrawerOpen(false)}
        />
      )}

      {/* Sandbox Detail Drawer */}
      {sandboxDrawerOpen && (
        <SandboxDetailPage
          state={state}
          onChange={updateState}
          onBack={() => setSandboxDrawerOpen(false)}
        />
      )}

      {/* Update Checker */}
      <UpdateChecker />
    </div>
  );
}

export default App;
