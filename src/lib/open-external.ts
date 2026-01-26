/**
 * Safe external URL opener that works on both mobile and desktop.
 * 
 * On mobile browsers, window.open() after an await is blocked by popup blockers.
 * This helper handles navigation differently based on the device:
 * - Mobile: Navigate in the same tab
 * - Desktop: Open in a new tab (pre-opened to avoid popup blocking)
 */

const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

interface OpenExternalOptions {
  /**
   * Force same tab navigation even on desktop
   */
  forceSameTab?: boolean;
  /**
   * URL to show while loading (only for desktop new tab)
   */
  loadingUrl?: string;
}

/**
 * Opens an external URL after an async operation.
 * Call this BEFORE the async operation to get a navigator function,
 * then call the navigator with the URL after the operation completes.
 * 
 * @example
 * const navigate = prepareExternalNavigation();
 * const url = await fetchCheckoutUrl();
 * navigate(url);
 */
export function prepareExternalNavigation(options: OpenExternalOptions = {}) {
  const { forceSameTab = false, loadingUrl = 'about:blank' } = options;
  
  // On mobile or if forced, we'll navigate in the same tab
  if (isMobile() || forceSameTab) {
    return (url: string | null) => {
      if (url) {
        window.location.href = url;
      }
    };
  }
  
  // On desktop, pre-open a blank window synchronously (during user gesture)
  // This avoids popup blockers
  const newWindow = window.open(loadingUrl, '_blank');
  
  return (url: string | null) => {
    if (url && newWindow && !newWindow.closed) {
      newWindow.location.href = url;
    } else if (url) {
      // Fallback if window was blocked or closed
      window.location.href = url;
    } else if (newWindow && !newWindow.closed) {
      // No URL returned, close the blank window
      newWindow.close();
    }
  };
}

/**
 * Simple check if we're on mobile
 */
export function isMobileDevice(): boolean {
  return isMobile();
}
