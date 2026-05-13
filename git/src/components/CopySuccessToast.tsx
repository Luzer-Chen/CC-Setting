import { useEffect, useRef, useCallback } from 'react';
import { Check } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CopySuccessToast({ open, onClose }: Props) {
  const { t } = useI18n();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) {
      clearTimer();
      return;
    }
    timerRef.current = setTimeout(() => {
      onClose();
    }, 1500);
    return clearTimer;
  }, [open, onClose, clearTimer]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-lg p-6 w-[340px] animate-modal-scale-in">
        {/* Logo + checkmark badge */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img
              src="/app-icon.png"
              alt="cc-setting"
              className="w-20 h-20 object-contain"
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#16A34A] flex items-center justify-center animate-checkmark-pop shadow-sm">
              <Check size={14} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-center text-sm font-semibold text-[var(--text-primary)] mb-1">
          {t('copy.title')}
        </h3>

        {/* Subtitle */}
        <p className="text-center text-xs text-[var(--text-muted)]">
          {t('copy.subtitle')}
        </p>
      </div>
    </div>
  );
}
