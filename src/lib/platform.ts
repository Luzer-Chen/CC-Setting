export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const internals = (window as any).__TAURI_INTERNALS__;
  if (internals?.platform) return internals.platform === 'ios';
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}
