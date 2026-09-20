/**
 * In-app clipboard helper that guarantees no browser-native alerts or permission crashes.
 * Gracefully tries navigator.clipboard, falls back to execCommand, and notifies UI if manual copy is needed.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try modern navigator.clipboard
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn('navigator.clipboard failed, attempting fallback', e);
    }
  }

  // 2. Fallback to textarea execCommand (in-app fallback, invisible to user)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) return true;
  } catch (err) {
    console.warn('execCommand fallback failed', err);
  }

  return false;
}
