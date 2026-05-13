import { X, AlertTriangle } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface Props {
  open: boolean;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function AgentTeamDrawer({ open, onClose, onMouseEnter, onMouseLeave }: Props) {
  const { t } = useI18n();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-lg p-6 w-[340px] animate-modal-scale-in pointer-events-auto"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Beta tag */}
        <div className="absolute top-3 right-10 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--accent-bg)] text-[#D97745] border border-[#D97745]/30">
          {t('agentTeams.beta')}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--text-disabled)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <X size={16} />
        </button>

        {/* Logo + warning badge */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img
              src="/app-icon.png"
              alt="cc-setting"
              className="w-20 h-20 object-contain"
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#D97745] flex items-center justify-center animate-checkmark-pop shadow-sm">
              <AlertTriangle size={14} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-center text-sm font-semibold text-[var(--text-primary)] mb-1">
          {t('agentTeams.drawerTitle')}
        </h3>

        {/* Experimental tag */}
        <div className="flex justify-center mb-2">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent-bg)] text-[#D97745]">
            {t('agentTeams.experimental')}
          </span>
        </div>

        {/* Description */}
        <p className="text-center text-xs text-[var(--text-muted)] leading-relaxed">
          {t('agentTeams.drawerDesc')}
        </p>
      </div>
    </div>
  );
}
