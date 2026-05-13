import { useEffect, useRef, useCallback } from 'react';
import { Check, FolderOpen, X } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { isIOS } from '../lib/platform';

interface Props {
  open: boolean;
  onClose: () => void;
  exportedFilePath?: string;
  exportedFolderPath?: string;
  onOpenFolder: () => void;
}

export default function ExportSuccessModal({ open, onClose, exportedFilePath, exportedFolderPath, onOpenFolder }: Props) {
  const { t } = useI18n();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Auto-close after 3s, pause on hover
  useEffect(() => {
    if (!open) {
      clearTimer();
      pausedRef.current = false;
      return;
    }

    const startTimer = () => {
      clearTimer();
      timerRef.current = setTimeout(() => {
        if (!pausedRef.current) {
          onClose();
        }
      }, 3000);
    };

    startTimer();

    return clearTimer;
  }, [open, onClose, clearTimer]);

  const handleMouseEnter = () => {
    pausedRef.current = true;
    clearTimer();
  };

  const handleMouseLeave = () => {
    pausedRef.current = false;
    timerRef.current = setTimeout(() => {
      onClose();
    }, 3000);
  };

  if (!open) return null;

  const fileName = exportedFilePath ? exportedFilePath.split('/').pop() || exportedFilePath : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 animate-modal-fade-in"
        onClick={onClose}
      />
      <div
        className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-lg p-6 w-[340px] animate-modal-scale-in"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--text-disabled)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <X size={16} />
        </button>

        {/* Logo + checkmark badge */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img
              src="/app-icon.png"
              alt="cc-setting"
              className="w-20 h-20 object-contain"
            />
            {/* Green checkmark badge */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#16A34A] flex items-center justify-center animate-checkmark-pop shadow-sm">
              <Check size={14} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-center text-sm font-semibold text-[var(--text-primary)] mb-1">
          {t('export.title')}
        </h3>

        {/* Description */}
        <p className="text-center text-xs text-[var(--text-muted)] mb-1">
          {t('export.desc')}
        </p>

        {/* File name */}
        {fileName && (
          <p className="text-center text-xs font-mono text-[var(--accent)] mb-5 truncate px-2" title={exportedFilePath}>
            {fileName}
          </p>
        )}

        {/* Buttons */}
        <div className={`flex gap-2 ${isIOS() ? 'justify-center' : ''}`}>
          {!isIOS() && (
            <button
              onClick={onOpenFolder}
              disabled={!exportedFolderPath}
              className="flex-1 text-xs bg-[var(--text-primary)] hover:bg-[var(--text-dark)] disabled:opacity-40 px-3 py-2 rounded-lg text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <FolderOpen size={13} />
              {t('export.openFolder')}
            </button>
          )}
          <button
            onClick={onClose}
            className={`${isIOS() ? 'flex-1' : ''} text-xs border border-[var(--border)] hover:border-[var(--text-disabled)] px-3 py-2 rounded-lg text-[var(--text-dark)] transition-colors`}
          >
            {t('export.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
