import { useState, useRef, useCallback, useEffect } from 'react';
import { AppState, DangerItem } from '../lib/types';
import { calcScore } from '../lib/danger-check';
import { Copy, Download } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { isIOS } from '../lib/platform';
import ExportSuccessModal from './ExportSuccessModal';
import ExportFailureModal from './ExportFailureModal';
import CopySuccessToast from './CopySuccessToast';
import AgentTeamDrawer from './AgentTeamDrawer';

interface Props {
  state: AppState;
  jsonOutput: string;
  dangers: DangerItem[];
  onOpenRiskSheet: () => void;
  onChange: (partial: Partial<AppState>) => void;
}

export default function ActionBar({ state, jsonOutput, dangers, onOpenRiskSheet, onChange }: Props) {
  const [exportSuccessOpen, setExportSuccessOpen] = useState(false);
  const [exportFailureOpen, setExportFailureOpen] = useState(false);
  const [exportErrorMsg, setExportErrorMsg] = useState('');
  const [copyToastOpen, setCopyToastOpen] = useState(false);
  const [exportedFilePath, setExportedFilePath] = useState('');
  const [exportedFolderPath, setExportedFolderPath] = useState('');
  const [agentTeamDrawerOpen, setAgentTeamDrawerOpen] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const drawerHoveredRef = useRef(false);
  const drawerOpenRef = useRef(false);
  const { t } = useI18n();

  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  // Global mousemove: detect if mouse is over card or drawer area
  // Register once, use refs to track current state
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const inCard = e.clientX >= rect.left && e.clientX <= rect.right
                  && e.clientY >= rect.top && e.clientY <= rect.bottom;
      const inDrawer = drawerHoveredRef.current;
      const inArea = inCard || inDrawer;

      if (inArea) {
        if (!drawerOpenRef.current) {
          drawerOpenRef.current = true;
          setAgentTeamDrawerOpen(true);
        }
      } else if (drawerOpenRef.current) {
        drawerOpenRef.current = false;
        setAgentTeamDrawerOpen(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDrawerMouseEnter = useCallback(() => {
    drawerHoveredRef.current = true;
    clearHoverTimer();
  }, [clearHoverTimer]);

  const handleDrawerMouseLeave = useCallback(() => {
    drawerHoveredRef.current = false;
    drawerOpenRef.current = false;
    setAgentTeamDrawerOpen(false);
  }, []);

  const handleDrawerClose = useCallback(() => {
    clearHoverTimer();
    drawerHoveredRef.current = false;
    drawerOpenRef.current = false;
    setAgentTeamDrawerOpen(false);
  }, [clearHoverTimer]);

  const score = calcScore(state, dangers);
  const reds = dangers.filter((d) => d.level === 'red').length;
  const yellows = dangers.filter((d) => d.level === 'yellow').length;
  const blues = dangers.filter((d) => d.level === 'blue').length;
  const greens = dangers.filter((d) => d.level === 'green').length;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopyToastOpen(true);
    } catch {
      try {
        const el = document.createElement('textarea');
        el.value = jsonOutput;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopyToastOpen(true);
      } catch {
        // copy failed silently
      }
    }
  };

  const exportFile = async () => {
    try {
      const paths = await import('../lib/paths');
      const targetPath = await paths.resolveTargetPath(state.targetType, state.projectDir);
      await paths.writeSettingsFile(targetPath, jsonOutput);

      const folderPath = targetPath.substring(0, targetPath.lastIndexOf('/'));
      setExportedFilePath(targetPath);
      setExportedFolderPath(folderPath);
      setExportSuccessOpen(true);
    } catch (e: any) {
      setExportErrorMsg(e.message || t('action.exportFailed'));
      setExportFailureOpen(true);
    }
  };

  const handleOpenFolder = async () => {
    if (!exportedFolderPath) return;
    if (isIOS()) { setExportSuccessOpen(false); return; }
    try {
      const paths = await import('../lib/paths');
      await paths.openFolder(exportedFolderPath);
    } catch {
      // failed to open folder
    }
    setExportSuccessOpen(false);
  };

  const handleRetryExport = () => {
    setExportFailureOpen(false);
    exportFile();
  };

  const getScoreTextColor = (s: number) => {
    if (s >= 90) return 'text-[var(--success)]';
    if (s >= 75) return 'text-[var(--success)]';
    if (s >= 60) return 'text-[var(--warning)]';
    if (s >= 40) return 'text-[var(--danger)]';
    return 'text-[var(--danger)]';
  };

  const getScoreBorderColor = (s: number) => {
    if (s >= 90) return 'border-[var(--success-border)]';
    if (s >= 75) return 'border-[var(--success-border)]';
    if (s >= 60) return 'border-[var(--warning-border)]';
    if (s >= 40) return 'border-[var(--danger-border)]';
    return 'border-[var(--danger-border)]';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 90) return t('risk.safe');
    if (s >= 75) return t('risk.mostlySafe');
    if (s >= 60) return t('risk.mediumRisk');
    if (s >= 40) return t('risk.highRisk');
    return t('risk.dangerous');
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-2 bg-[var(--bg-page-alt)] border-t border-[var(--border)]">
        {/* Left: Score */}
        <button
          onClick={onOpenRiskSheet}
          className={`flex items-center gap-2 px-3 py-1.5 rounded border ${getScoreBorderColor(score)} hover:bg-[var(--accent-bg)] transition-colors`}
          title={t('action.clickForDetails')}
        >
          <span className={`text-lg font-bold ${getScoreTextColor(score)}`}>{score}</span>
          <div className="leading-tight">
            <div className="text-[10px] text-[var(--text-secondary)]">{t('action.score')}</div>
            <div className={`text-[9px] ${getScoreTextColor(score)}`}>{getScoreLabel(score)}</div>
          </div>
        </button>

        {/* Middle: Risk entries */}
        <button
          onClick={onOpenRiskSheet}
          className="flex items-center gap-2 text-xs hover:bg-[var(--accent-bg)] px-2 py-1 rounded transition-colors flex-1 min-w-0"
          title={t('action.clickForDetails')}
        >
          {reds > 0 && (
            <span className="bg-[var(--danger-bg)] text-[var(--danger)] px-1.5 py-0.5 rounded whitespace-nowrap">{t('danger.high')} {reds}</span>
          )}
          {yellows > 0 && (
            <span className="bg-[var(--warning-bg)] text-[var(--warning)] px-1.5 py-0.5 rounded whitespace-nowrap">{t('danger.medium')} {yellows}</span>
          )}
          {blues > 0 && (
            <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded whitespace-nowrap">{t('danger.low')} {blues}</span>
          )}
          {greens > 0 && (
            <span className="bg-[var(--success-bg)] text-[var(--success)] px-1.5 py-0.5 rounded whitespace-nowrap">{t('danger.safe')} {greens}</span>
          )}
          {dangers.length === 0 && (
            <span className="text-[var(--text-disabled)]">{t('action.noRisk')}</span>
          )}
        </button>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Agent Team horizontal toggle */}
          <div
            ref={cardRef}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors ${
              state.agentTeamsEnabled
                ? 'border-[#D97745] bg-[var(--accent-bg)]'
                : 'border-[var(--border)] bg-[var(--bg-card)]'
            }`}
          >
            <span className={`text-[10px] font-medium ${state.agentTeamsEnabled ? 'text-[#D97745]' : 'text-[var(--text-disabled)]'}`}>
              Agent Team
            </span>
            <button
              role="switch"
              aria-checked={state.agentTeamsEnabled}
              onClick={(e) => {
                e.stopPropagation();
                onChange({ agentTeamsEnabled: !state.agentTeamsEnabled });
              }}
              className={`relative w-7 h-[15px] rounded-full transition-colors shrink-0 ${
                state.agentTeamsEnabled ? 'bg-[#D97745]' : 'bg-[var(--text-disabled)]'
              }`}
              title={state.agentTeamsEnabled ? t('agentTeams.enabled') : t('agentTeams.disabled')}
            >
              <span className={`absolute top-[1.5px] left-[1.5px] w-[12px] h-[12px] rounded-full bg-white shadow transition-transform ${
                state.agentTeamsEnabled ? 'translate-x-[11px]' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <button
            onClick={copyToClipboard}
            className="text-xs bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-bg)] px-3 py-1.5 rounded text-[var(--text-dark)] transition-colors flex items-center gap-1"
          >
            <Copy size={12} /> {t('action.copy')}
          </button>

          <button
            onClick={exportFile}
            className="text-xs bg-[var(--text-primary)] hover:bg-[var(--text-dark)] px-3 py-1.5 rounded text-white transition-colors flex items-center gap-1"
          >
            <Download size={12} /> {t('action.export')}
          </button>
        </div>
      </div>

      <ExportSuccessModal
        open={exportSuccessOpen}
        onClose={() => setExportSuccessOpen(false)}
        exportedFilePath={exportedFilePath}
        exportedFolderPath={exportedFolderPath}
        onOpenFolder={handleOpenFolder}
      />

      <ExportFailureModal
        open={exportFailureOpen}
        onClose={() => setExportFailureOpen(false)}
        errorMessage={exportErrorMsg}
        exportedFolderPath={exportedFolderPath}
        onOpenFolder={() => {
          if (exportedFolderPath && !isIOS()) {
            import('../lib/paths').then((paths) => paths.openFolder(exportedFolderPath)).catch(() => {});
          }
          setExportFailureOpen(false);
        }}
        onRetry={handleRetryExport}
      />

      <CopySuccessToast
        open={copyToastOpen}
        onClose={() => setCopyToastOpen(false)}
      />

      <AgentTeamDrawer
        open={agentTeamDrawerOpen}
        onClose={handleDrawerClose}
        onMouseEnter={handleDrawerMouseEnter}
        onMouseLeave={handleDrawerMouseLeave}
      />
    </>
  );
}
