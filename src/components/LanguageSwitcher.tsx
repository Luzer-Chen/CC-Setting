import { useI18n, Locale } from '../lib/i18n';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const toggleLocale = () => {
    setLocale(locale === 'zh' ? 'en' : 'zh');
  };

  return (
    <button
      onClick={toggleLocale}
      className="border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)] hover:bg-[var(--accent-bg)] transition-colors flex items-center gap-1"
      title={locale === 'zh' ? '切换到英文' : 'Switch to Chinese'}
    >
      <Globe size={14} />
      <span>{locale === 'zh' ? 'EN' : '中'}</span>
    </button>
  );
}
