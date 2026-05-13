import { useState, useEffect } from 'react';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { Download, RefreshCw, X } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { isIOS } from '../lib/platform';

export default function UpdateChecker() {
  const [update, setUpdate] = useState<Update | null>(null);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (isIOS()) return; // iOS updates via App Store
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    setChecking(true);
    try {
      const update = await check();
      if (update) {
        setUpdate(update);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleDownload = async () => {
    if (!update) return;

    setDownloading(true);
    try {
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            console.log('Download started');
            break;
          case 'Progress':
            console.log(`Downloaded ${event.data.chunkLength} bytes`);
            break;
          case 'Finished':
            console.log('Download finished');
            setDownloaded(true);
            break;
        }
      });
    } catch (error) {
      console.error('Failed to download update:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleRestart = async () => {
    await relaunch();
  };

  if (!update || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-lg p-4 max-w-sm animate-scale-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Download size={16} className="text-[var(--accent)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">{t('update.title')}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mb-3">
        <p className="text-xs text-[var(--text-secondary)] mb-1">
          {t('update.available').replace('{version}', update.version)}
        </p>
        {update.body && (
          <p className="text-xs text-[var(--text-muted)] line-clamp-2">
            {update.body}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {!downloaded ? (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 px-3 py-1.5 rounded text-white transition-colors flex items-center justify-center gap-1"
          >
            {downloading ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                {t('update.downloading')}
              </>
            ) : (
              <>
                <Download size={12} />
                {t('update.download')}
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleRestart}
            className="flex-1 text-xs bg-[var(--success)] hover:bg-[var(--success)] px-3 py-1.5 rounded text-white transition-colors flex items-center justify-center gap-1"
          >
            <RefreshCw size={12} />
            {t('update.restart')}
          </button>
        )}
      </div>
    </div>
  );
}
